import {CompilerConfig} from '@ton/blueprint';

console.log(`jetton wallet module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/tests/ft/jetton-wallet.fc'],
};
