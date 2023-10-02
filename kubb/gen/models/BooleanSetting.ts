
export const booleanSettingType = {
    "BOOLEAN": "BOOLEAN"
} as const;
export type BooleanSettingType = (typeof booleanSettingType)[keyof typeof booleanSettingType];
export type BooleanSetting = {
    /**
     * @type string
    */
    name: string;
    /**
     * @type string
    */
    type: BooleanSettingType;
    /**
     * @type boolean
    */
    value: boolean;
};
