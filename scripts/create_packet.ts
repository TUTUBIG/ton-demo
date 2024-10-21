import { compile, NetworkProvider } from '@ton/blueprint';
import { WTonWalletWrapper } from '../adapters/WTonWallet.wrapper';
import { Address, fromNano, toNano } from '@ton/core';
import { RouterWrapper } from '../adapters/Router.wrapper';
import { Params } from '../adapters/Params';
import { RedPacketWrapper } from '../adapters/RedPacket.wrapper';
import { JettonWalletWrapper } from '../adapters/JettonWallet.wrapper';
import { JettonMinterWrapper } from '../adapters/JettonMinter.wrapper';
import { WTonMinterWrapper } from '../adapters/WTonMinter.wrapper';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender()
    if (!sender.address) {
        throw new Error("empty sender address")
    }

    const routerAddress = Address.parse("EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-")
    const router = provider.open(RouterWrapper.createFromAddress(routerAddress))
    const fee = await router.getRouterCreateTxFee()
    console.log(`router tx fee ${fromNano(fee)}`)

    // const jetTonMinterAddress = Address.parse("kQD7Iy-XHNhUusAqlzci2oLSygKKUviP5CJYfEK349rZOsoY")
    // const jetTonMinter = provider.open(JettonMinterWrapper.createFromAddress(jetTonMinterAddress))
    // const jetTonWalletAddress = await jetTonMinter.getWalletAddress(sender.address)
    // const jetTonWallet = provider.open(JettonMinterWrapper.createFromAddress(jetTonWalletAddress))
    // const { body,tonAmount } = JettonWalletWrapper.buildTransfer({
    //     queryId: 10000n,
    //     jettonAmount: toNano(0.2),
    //     toOwner: router.address,
    //     responseAddress: sender.address,
    //     forwardTonAmount: fee,
    //     forwardPayload: RouterWrapper.buildCreate({
    //         create: Params.composeCreatePayload({
    //             op: "single",
    //         })
    //     })
    // })
    //
    // console.log("ton amount ",tonAmount)
    //
    // await jetTonWallet.sendTx(sender,tonAmount,body)

    const wTonWalletCode = await compile(`WTonWallet`);

    const wTonMinter = provider.open(WTonMinterWrapper.createFromAddress(Address.parse("kQB6sxzwgGHG8mzAFxBFtScp4tjvK7B-23SnDv_GqNlzZ7l7")))

    const wTonWallet = provider.open(WTonWalletWrapper.createFromConfig({
        owner: sender.address,
        minter: wTonMinter.address,
        walletCode: wTonWalletCode
    },wTonWalletCode))

    const {body, tonAmount} = WTonWalletWrapper.buildTransfer(
        {
            queryId: 10002n,
            jettonAmount: toNano(0.2),
            toOwner: router.address,
            responseAddress: sender.address,
            forwardTonAmount: fee,
            forwardPayload: RouterWrapper.buildCreate({
                create: Params.composeCreatePayload({
                    op: "single",
                })
            }),
        }
    )

    await wTonWallet.sendTx(sender,tonAmount,body)
}