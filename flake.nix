{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-23.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils, ... } @ inputs:
    flake-utils.lib.eachDefaultSystem (system:
      let
          pkgs = nixpkgs.legacyPackages.${system};
      in {
        packages = rec {
          boba-frontend-assets = pkgs.yarn2nix-moretea.mkYarnPackage {
            name = "boba-frontend";
            version = "0.0.1";
            src = ./.;
            dontFixup = true;
            doDist = false;
            nodejs = pkgs.nodejs-18_x;
            NODE_OPTIONS = "--openssl-legacy-provider";
            buildPhase = ''
              export NODE_MODULES_PARENT_PATH=$PWD
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
            export NODE_PATH=${boba-frontend-assets}/libexec/boba-frontend/node_modules
            export NODE_OPTIONS="--openssl-legacy-provider";
            export DEBUG=boba-frontend:*,-*info
            ${boba-frontend-assets}/libexec/boba-frontend/node_modules/.bin/next start "${boba-frontend-assets}/libexec/boba-frontend/deps/bobaboard-frontend"
          '';
          default = boba-frontend;
      };
    }
  );
}