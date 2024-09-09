import {CompilerConfig} from '@ton/blueprint';

console.log(`red_packet0 module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/red_packet/red_packet0.fc'],
};
