import { IInputs } from "../generated/ManifestTypes";

export type IMultiSelect = { 
    onChange: (json: string | undefined)  => void;
    context: ComponentFramework.Context<IInputs> | undefined;
}

