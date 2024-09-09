import {CompilerConfig} from '@ton/blueprint';

console.log(`jetton minter module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/tests/ft/jetton-minter.fc'],
};
