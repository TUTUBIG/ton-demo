import {CompilerConfig} from '@ton/blueprint';

console.log(`router0 module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/router/router0.fc'],
};
