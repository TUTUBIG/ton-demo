import {CompilerConfig} from '@ton/blueprint';

console.log(`router1 module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/router/router1.fc'],
};
