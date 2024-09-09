import {CompilerConfig} from '@ton/blueprint';

console.log(`wton minter module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/imports/wton/jetton-minter.fc'],
};
