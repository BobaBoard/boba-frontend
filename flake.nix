{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.11";
    systems.url = "github:nix-systems/default";
  };

  outputs = { self, nixpkgs, systems, ... } @ inputs:
    # let
    #   forEachSystem = nixpkgs.lib.genAttrs (import systems);
    # in
    # forEachSystem (system:
      let
        system = "aarch64-darwin"; 
        pkgs = import nixpkgs {
          overlays = [
            (self: super: {
              nodejs = super.nodejs.overrideAttrs (oldAttrs: {
                version = "16.16.0";
              });
            })
          ];
          config = { allowUnfree = true; };
          system = system;
        };
      in {
        packages.${system} = rec {
          boba-frontend-assets = pkgs.yarn2nix-moretea.mkYarnPackage {
            name="boba-frontend";
            version="0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            buildPhase = ''
              node -v
              yarn build
            '';
            distPhase = "";
            installPhase = ''
              mkdir -p $out/libexec/boba-frontend
              mv node_modules $out/libexec/boba-frontend/
              mv deps $out/libexec/boba-frontend/
            '';
          };
          boba-frontend = pkgs.writeShellScriptBin "boba-frontend" ''
            ls -la
            exit 1
            export NODE_PATH=${boba-frontend-assets}/libexec/boba-frontend/node_modules
            export GOOGLE_APPLICATION_CREDENTIALS_PATH=$(pwd)/firebase-sdk.json
            export DEBUG=boba-frontend:*,-*info

            ${pkgs.nodejs}/bin/node -r dotenv/config ${boba-frontend-assets}/libexec/boba-frontend/node_modules/boba-frontend/dist/server/index.js
          '';
          default = boba-frontend;
        };
      };
      # );
}