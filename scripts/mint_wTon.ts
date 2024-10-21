import { NetworkProvider } from '@ton/blueprint';
import { Address, toNano } from '@ton/core';
import { WTonMinterWrapper } from '../adapters/WTonMinter.wrapper';
import { JettonMinterWrapper } from '../adapters/JettonMinter.wrapper';

export async function run(provider: NetworkProvider) {
    const sender = provider.sender()
    if (!sender.address) {
        throw new Error("empty sender address")
    }

    // const wTonMinter = provider.open(WTonMinterWrapper.createFromAddress(Address.parse("EQCqa8bBrpnytxPbgjK6LtOJ8R_qLxtkwTwq_n1FtOROa2if")))
    // const data = await wTonMinter.getJettonData()
    // console.log(data)
    //
    const routerAddress = Address.parse("EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-")
    // const queryId = Math.floor(Date.now() / 1000)
    // const body = JettonMinterWrapper.mintMessage(routerAddress,toNano(0.1),toNano(10),sender.address,queryId)
    //
    // await wTonMinter.sendTx(sender,toNano(0.1),body)

    const jtMinter = provider.open(JettonMinterWrapper.createFromAddress(Address.parse("kQD7Iy-XHNhUusAqlzci2oLSygKKUviP5CJYfEK349rZOsoY")))
    await jtMinter.sendMint(sender,{
        to_address: sender.address,
        jetton_amount: toNano(1_000_000_000),
        response_address: sender.address
    })
}