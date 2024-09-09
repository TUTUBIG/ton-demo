import {CompilerConfig} from '@ton/blueprint';

console.log(`red_packet1 module compiles`)
export const compile: CompilerConfig = {
    targets: ['contracts/red_packet/red_packet1.fc'],
};
