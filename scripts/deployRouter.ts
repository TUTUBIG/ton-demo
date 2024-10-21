import {address, Address, beginCell, toNano} from '@ton/core';
import {compile, NetworkProvider} from '@ton/blueprint';
import {saveToFile} from "./save";
import {RouterWrapper} from "../adapters/Router.wrapper";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {addressZero, buildCodeDeployment} from "./utils";
import {WTonMinterWrapper} from "../adapters/WTonMinter.wrapper";
import {WTonWalletWrapper} from "../adapters/WTonWallet.wrapper";
import { JettonMinterWrapper } from '../adapters/JettonMinter.wrapper';

export async function run(provider: NetworkProvider) {

    let save: Record<string, any> = {}
    save.network = provider.network()


    console.log(`deployer: ${provider.sender().address}`)
    const deployer = provider.sender().address

    if (!deployer) {
        throw new Error("invalid deployer")
    }

    //provider address
    let reporter = deployer
    let server1 = deployer

    const seed = "valve speak pulse glue unfold cloth reunion movie valve celery path setup pottery tiny wait excite develop wage lend silver zero bacon hip impulse"

    //give a mnemonic for code manager, you had better to load it from .env
    let codeManagerKeyPair = await mnemonicToPrivateKey(seed.split(` `));
    let codeManagerPublicKey = BigInt(`0x` + codeManagerKeyPair.publicKey.toString(`hex`));

    let routerBaseCode = await compile("Router0");
    let routerDeployment = buildCodeDeployment(codeManagerKeyPair, 1, await compile("Router1"));
    let redPacketBaseCode = await compile("RedPacket0");
    let redPacketDeployment = buildCodeDeployment(codeManagerKeyPair, 1, await compile("RedPacket1"));

    // let router = provider.open((
    //     RouterWrapper.createFromConfig(
    //         {
    //             codeManagerPublicKey: codeManagerPublicKey,
    //             ctx: Math.floor(Math.random() * 1000) % (2**8),
    //             routerAdmin: deployer
    //         },
    //         routerBaseCode,
    //     )
    // ));
    //
    // await router.sendTx(
    //     provider.sender(),
    //     toNano('0.1'),
    //     RouterWrapper.buildDeploy({
    //         routerDeployment
    //     })
    // );
    // await provider.waitForDeploy(router.address);
    //
    // // router: https://testnet.tonscan.org/address/EQB6-49E2nLIB0nzVhlN_aSVpBRgVFU7DXcuYfL-6zEz229-
    //
    // console.log(`router ${router.address} dont forget to check tonview to see the tx is successful`);
    // save[`router`] = router.address.toString()
    // await saveToFile(save, `deployRouter`, false, provider)
    //
    // await router.sendTx(
    //     provider.sender(),
    //     toNano('0.1'),
    //     RouterWrapper.buildInit({
    //         reporter: reporter,
    //         redPacketBaseCode,
    //         redPacketDeployment,
    //         server0: server1,
    //         server1: addressZero,
    //         server2: addressZero,
    //     })
    // );


    // let jettonWalletCode = await compile(`JettonWallet`);
    // let jettonMinterCode = await compile(`JettonMinter`);
    //
    // let jMinter = provider.open(JettonMinterWrapper.createFromConfig({
    //     admin: deployer,
    //     content: JettonMinterWrapper.createJettonMinterContentCell(),
    //     wallet_code: jettonWalletCode
    // },jettonMinterCode))
    //
    // await jMinter.sendTx(
    //     provider.sender(),
    //     toNano('0.1'),
    //     beginCell().endCell()
    // );

    let wTonWalletCode = await compile(`WTonWallet`);
    let wTonMinterCode = await compile(`WTonMinter`);


    let wTonMinter = provider.open((
        WTonMinterWrapper.createFromConfig(
            {
                content: JettonMinterWrapper.createWTonMinterContentCell(),
                walletCode: wTonWalletCode,

            },
            wTonMinterCode,
        )
    ));
    await wTonMinter.sendTx(
        provider.sender(),
        toNano('0.1'),
        beginCell().endCell()
    );
    // await provider.waitForDeploy(wTonMinter.address);
    //
    // // https://testnet.tonscan.org/address/EQCqa8bBrpnytxPbgjK6LtOJ8R_qLxtkwTwq_n1FtOROa2if
    //
    //
    // let wTonWalletRouter = provider.open(
    //     WTonWalletWrapper.createFromConfig({
    //             owner: router.address,
    //             minter: wTonMinter.address,
    //             walletCode: wTonWalletCode
    //         },
    //         wTonWalletCode
    //     )
    // );
    //
    // await wTonWalletRouter.sendTx(
    //     provider.sender(),
    //     toNano('0.1'),
    //     WTonWalletWrapper.buildNothing()
    // );
    // await provider.waitForDeploy(wTonWalletRouter.address);
    //
    // // https://testnet.tonscan.org/address/EQAkQsCPJqG-3lYM4wqb7YEMY5RqZfVX4Osp7VjWjnBMrdoZ

    // myWTonWallet = provider.open(WTonWalletWrapper.cre)
}

