import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    toNano
} from '@ton/core';

export class WTonWalletWrapper implements Contract {
    static readonly Opcodes = {
        nothing: 0x10000001,
    };
    //这个会根据payload的长度不同,暂时假定为0.05
    static ForwardGasFee = toNano(0.01)
    static LogicGas = toNano(0.015)
    static StorageMaintenance = toNano(0.01)

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new WTonWalletWrapper(address);
    }

    static createFromConfig(config: {
        owner: Address,
        minter: Address,
        walletCode: Cell
    }, code: Cell, workchain = 0) {
        const data = beginCell()
            .storeAddress(config.owner)
            .storeAddress(config.minter)
            .storeRef(config.walletCode)
            .endCell();
        const init = {code, data};
        return new WTonWalletWrapper(contractAddress(workchain, init), init);
    }

    static buildNothing() {
        return beginCell()
            .storeUint(WTonWalletWrapper.Opcodes.nothing, 32)
            .storeUint(0, 64)

            .endCell();
    }

    static buildTransfer(
        opts: {
            queryId: bigint | number,
            jettonAmount: bigint | number,
            toOwner: Address,
            responseAddress: Address,
            // customPayload: Cell | null,
            forwardTonAmount: bigint | number,
            forwardPayload: Cell | null,
        }
    ) {
        let body = beginCell()
            .storeUint(0x0f8a7ea5, 32)// op
            .storeUint(opts.queryId, 64) // queryId
            .storeCoins(opts.jettonAmount)
            .storeAddress(opts.toOwner)
            .storeAddress(opts.responseAddress)
            .storeMaybeRef(null)
            .storeCoins(opts.forwardTonAmount)
            .storeMaybeRef(opts.forwardPayload)
            .endCell();
        let tonAmount = BigInt(opts.jettonAmount)
            + WTonWalletWrapper.ForwardGasFee
            + (opts.forwardTonAmount > 0 ? BigInt(opts.forwardTonAmount) + WTonWalletWrapper.ForwardGasFee : 0n)
            + WTonWalletWrapper.LogicGas * 2n
            + WTonWalletWrapper.StorageMaintenance
        ;

        return {
            body,
            tonAmount
        }
    }

    static buildExternalTransfer(
        opts: {
            queryId: bigint | number,
            jettonAmount: bigint | number,
            responseAddress: Address,
            forwardTonAmount: bigint | number,
            forwardPayload: Cell | null,
        }
    ) {
        return beginCell()
            .storeUint(0x05db0ab7, 32)// op
            .storeUint(opts.queryId, 64) // queryId
            .storeCoins(opts.jettonAmount)
            .storeAddress(opts.responseAddress)
            .storeCoins(opts.forwardTonAmount)
            .storeMaybeRef(opts.forwardPayload)
            .endCell();
    }

    static buildBurn(
        opts: {
            queryId: bigint | number,
            jettonAmount: bigint | number,
            responseAddress: Address,
        }
    ) {
        return beginCell()
            .storeUint(0x595f07bc, 32)// op
            .storeUint(opts.queryId, 64) // queryId
            .storeCoins(opts.jettonAmount)
            .storeAddress(opts.responseAddress)
            .endCell();
    }

    async sendTx(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    async getWalletData(provider: ContractProvider) {
        let state = await provider.getState();
        if (state.state.type !== 'active') {
            return null;
        }
        let res = await provider.get('get_wallet_data', []);
        let balance = res.stack.readBigNumber();
        let ownerAddress = res.stack.readAddress();
        let jettonMasterAddress = res.stack.readAddress();
        let jettonWalletCode = res.stack.readCell();
        return {
            balance,
            ownerAddress,
            jettonMasterAddress,
            jettonWalletCode
        }
    }
}
