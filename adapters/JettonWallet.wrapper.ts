import {Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, toNano} from '@ton/core';

export class JettonWalletWrapper implements Contract {
    static ForwardGasFee = toNano(0.1)
    static TransferDefaultValue = toNano(0.1)

    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new JettonWalletWrapper(address);
    }

    static buildTransferValue(forwardTonAmount: bigint) {
        return JettonWalletWrapper.TransferDefaultValue + forwardTonAmount + JettonWalletWrapper.ForwardGasFee;
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
            .storeUint(0xf8a7ea5, 32)
            .storeUint(opts.queryId, 64) // op, queryId
            .storeCoins(opts.jettonAmount)
            .storeAddress(opts.toOwner)
            .storeAddress(opts.responseAddress)
            .storeMaybeRef(null)
            .storeCoins(opts.forwardTonAmount)
            .storeMaybeRef(opts.forwardPayload)
            .endCell();

        let tonAmount = JettonWalletWrapper.TransferDefaultValue + BigInt(opts.forwardTonAmount) + JettonWalletWrapper.ForwardGasFee;

        return {
            body,
            tonAmount
        }
    }

    /*
      burn#595f07bc query_id:uint64 amount:(VarUInteger 16)
                    response_destination:MsgAddress custom_payload:(Maybe ^Cell)
                    = InternalMsgBody;
    */
    static burnMessage(jetton_amount: bigint,
                       responseAddress: Address,
                       customPayload: Cell | null) {
        return beginCell().storeUint(0x595f07bc, 32).storeUint(0, 64) // op, queryId
            .storeCoins(jetton_amount).storeAddress(responseAddress)
            .storeMaybeRef(customPayload)
            .endCell();
    }

    /*
      withdraw_tons#107c49ef query_id:uint64 = InternalMsgBody;
    */
    static withdrawTonsMessage() {
        return beginCell().storeUint(0x6d8e5e3c, 32).storeUint(0, 64) // op, queryId
            .endCell();
    }

    /*
      withdraw_jettons#10 query_id:uint64 wallet:MsgAddressInt amount:Coins = InternalMsgBody;
    */
    static withdrawJettonsMessage(from: Address, amount: bigint) {
        return beginCell().storeUint(0x768a50b2, 32).storeUint(0, 64) // op, queryId
            .storeAddress(from)
            .storeCoins(amount)
            .storeMaybeRef(null)
            .endCell();
    }

    async sendTx(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    async getJettonBalance(provider: ContractProvider) {
        let state = await provider.getState();
        if (state.state.type !== 'active') {
            return 0n;
        }
        let res = await provider.get('get_wallet_data', []);
        return res.stack.readBigNumber();
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

    async sendBurn(provider: ContractProvider, via: Sender, value: bigint,
                   jetton_amount: bigint,
                   responseAddress: Address,
                   customPayload: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonWalletWrapper.burnMessage(jetton_amount, responseAddress, customPayload),
            value: value
        });

    }

    async sendWithdrawTons(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonWalletWrapper.withdrawTonsMessage(),
            value: toNano('0.1')
        });

    }

    async sendWithdrawJettons(provider: ContractProvider, via: Sender, from: Address, amount: bigint) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonWalletWrapper.withdrawJettonsMessage(from, amount),
            value: toNano('0.1')
        });

    }
}
