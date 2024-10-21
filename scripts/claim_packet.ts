import { NetworkProvider } from '@ton/blueprint';
import { Address, fromNano } from '@ton/core';
import { RouterWrapper } from '../adapters/Router.wrapper';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender()
    if (!sender.address) {
        throw new Error("empty sender address")
    }

    const routerAddress = Address.parse("EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-")
    const router = provider.open(RouterWrapper.createFromAddress(routerAddress))
    const fee = await router.getRouterClaimTxFee()
    console.log(`router tx fee ${fromNano(fee)}`)

    const claimer = Address.parse("UQC9PvgW7jnaAS8jWRcUx09muFcDgeYga9MH6EaG3y_mKrpJ")

    const body = RouterWrapper.buildClaim({
        recipient: claimer,
        redPacketIndex: 1,
        queryId: 10003n,
    })

    await router.sendTx(sender,fee,body)
}