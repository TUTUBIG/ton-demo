import {Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode} from '@ton/core';

export class WTonMinterWrapper implements Contract {
    static readonly Opcodes = {
        nothing: 0x10000001,
    };

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new WTonMinterWrapper(address);
    }

    static createFromConfig(config: {
        content: Cell,
        walletCode: Cell
    }, code: Cell, workchain = 0) {
        const data = beginCell()
            .storeRef(config.content)
            .storeRef(config.walletCode)
            .endCell();
        const init = {code, data};
        return new WTonMinterWrapper(contractAddress(workchain, init), init);
    }

    static buildNothing() {
        return beginCell()
            .storeUint(WTonMinterWrapper.Opcodes.nothing, 32)
            .storeUint(0, 64)

            .endCell();
    }

    async sendTx(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    async getWalletAddress(provider: ContractProvider, owner: Address): Promise<Address> {
        const res = await provider.get('get_wallet_address', [{
            type: 'slice',
            cell: beginCell().storeAddress(owner).endCell()
        }])
        return res.stack.readAddress()
    }

    async getJettonData(provider: ContractProvider) {
        let res = await provider.get('get_jetton_data', []);
        let totalSupply = res.stack.readBigNumber();
        let mintable = res.stack.readBoolean();
        // let adminAddress = res.stack.readAddress();
        let content = res.stack.readCell();
        let walletCode = res.stack.readCell();
        return {
            totalSupply,
            mintable,
            //adminAddress,
            content,
            walletCode,
        };
    }
}
