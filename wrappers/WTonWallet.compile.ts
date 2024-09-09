import {CompilerConfig} from '@ton/blueprint';

console.log(`wton wallet module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/imports/wton/jetton-wallet.fc'],
};
