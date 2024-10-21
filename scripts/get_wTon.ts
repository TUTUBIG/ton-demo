import { NetworkProvider } from '@ton/blueprint';
import { Address, fromNano, toNano } from '@ton/core';
import { RouterWrapper } from '../adapters/Router.wrapper';
import { WTonWalletWrapper } from '../adapters/WTonWallet.wrapper';
import { WTonMinterWrapper } from '../adapters/WTonMinter.wrapper';
import { JettonMinterWrapper } from '../adapters/JettonMinter.wrapper';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender()
    if (!sender.address) {
        throw new Error("empty sender address")
    }

    const routerAddress = Address.parse("EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-")
    // const router = provider.open(RouterWrapper.createFromAddress(routerAddress))
    //
    // const wTonMinterAddress = Address.parse("EQCqa8bBrpnytxPbgjK6LtOJ8R_qLxtkwTwq_n1FtOROa2if")
    // const wTonMinter = provider.open(WTonMinterWrapper.createFromAddress(wTonMinterAddress))
    //
    // const routerWTonWalletAddress = await wTonMinter.getWalletAddress(router.address)
    // const routerWTonWallet = provider.open(WTonWalletWrapper.createFromAddress(routerWTonWalletAddress))
    // const walletData = await routerWTonWallet.getWalletData()
    // if (!walletData) {
    //     console.log('balance',0)
    // } else {
    //     console.log('balance', fromNano(walletData.balance))
    // }



}