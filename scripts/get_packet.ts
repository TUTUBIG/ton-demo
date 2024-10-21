import { NetworkProvider } from '@ton/blueprint';
import { Address } from '@ton/core';
import { RouterWrapper } from '../adapters/Router.wrapper';
import { RedPacketWrapper } from '../adapters/RedPacket.wrapper';

export async function run(provider: NetworkProvider) {
    const routerAddress = Address.parse("EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-")
    const router = provider.open(RouterWrapper.createFromAddress(routerAddress))
    const redPacketAddress = await router.getRedPacket({redPacketIndex:1})
    const redPacket = provider.open(RedPacketWrapper.createFromAddress(redPacketAddress))
    console.log(`red packet address: ${redPacket.address}`)
    const redPacketContract = provider.open(RedPacketWrapper.createFromAddress(redPacketAddress))
    const storage = await redPacketContract.getStorage()
    console.log(`red packet: ${storage.totalSupply}`)
}