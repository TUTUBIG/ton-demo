import {address, Address, beginCell, toNano} from '@ton/core';
import {compile, NetworkProvider} from '@ton/blueprint';
import {saveToFile} from "./save";
import {RouterWrapper} from "../adapters/Router.wrapper";
import {mnemonicToPrivateKey} from "@ton/crypto";
import {addressZero, buildCodeDeployment} from "./utils";
import {WTonMinterWrapper} from "../adapters/WTonMinter.wrapper";
import {WTonWalletWrapper} from "../adapters/WTonWallet.wrapper";

export async function run(provider: NetworkProvider) {

    let save: Record<string, any> = {}
    save.network = provider.network()


    console.log(`deployer: ${provider.sender().address}`)
    const deployer = provider.sender().address!!

    //provider address
    let reporter = address(``)
    let server1 = address(``)

    //give a mnemonic for code manager, you had better to load it from .env
    let codeManagerKeyPair = await mnemonicToPrivateKey('test test test test test test test test test test test code'.split(` `));
    let codeManagerPublicKey = BigInt(`0x` + codeManagerKeyPair.publicKey.toString(`hex`));

    let routerBaseCode = await compile("Router0");
    let routerDeployment = buildCodeDeployment(codeManagerKeyPair, 1, await compile("Router1"));
    let redPacketBaseCode = await compile("RedPacket0");
    let redPacketDeployment = buildCodeDeployment(codeManagerKeyPair, 1, await compile("RedPacket1"));

    let router = provider.open((
        RouterWrapper.createFromConfig(
            {
                codeManagerPublicKey: codeManagerPublicKey,
                ctx: Math.floor(Math.random() * 1000) % (2**8),
                routerAdmin: deployer
            },
            routerBaseCode,
        )
    ));

    await router.sendTx(
        provider.sender(),
        toNano('0.1'),
        RouterWrapper.buildDeploy({
            routerDeployment
        })
    );
    await provider.waitForDeploy(router.address);

    console.log(`router ${router.address} dont forget to check tonview to see the tx is successful`);
    save[`router`] = router.address.toString()
    await saveToFile(save, `deployRouter`, false, provider)

    await router.sendTx(
        provider.sender(),
        toNano('0.1'),
        RouterWrapper.buildInit({
            reporter: reporter,
            redPacketBaseCode,
            redPacketDeployment,
            server0: server1,
            server1: addressZero,
            server2: addressZero,
        })
    );



    let wTonWalletCode = await compile(`WTonWallet`);
    let wTonMinterCode = await compile(`WTonMinter`);


    let wTonMinter = provider.open((
        WTonMinterWrapper.createFromConfig(
            {
                content: beginCell().storeUint(1, 1).endCell(),
                walletCode: wTonWalletCode,
            },
            wTonMinterCode,
        )
    ));
    await wTonMinter.sendTx(
        provider.sender(),
        toNano('0.1'),
        WTonMinterWrapper.buildNothing()
    );
    await provider.waitForDeploy(wTonMinter.address);


    let wTonWalletRouter = provider.open(
        WTonWalletWrapper.createFromConfig({
                owner: router.address,
                minter: wTonMinter.address,
                walletCode: wTonWalletCode
            },
            wTonWalletCode
        )
    );

    await wTonWalletRouter.sendTx(
        provider.sender(),
        toNano('0.1'),
        WTonWalletWrapper.buildNothing()
    );
    await provider.waitForDeploy(wTonWalletRouter.address);

}

