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

import {Op} from './JettonConstants';

export type JettonMinterConfig = { admin: Address; content: Cell; wallet_code: Cell };

export function jettonMinterConfigToCell(config: JettonMinterConfig): Cell {
    return beginCell()
        .storeCoins(0)//total supply一开始要设定为0
        .storeAddress(config.admin)
        .storeRef(config.content)
        .storeRef(config.wallet_code)
        .storeUint(0, 1)
        .endCell();
}

export class JettonMinterWrapper implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {
    }

    static createFromAddress(address: Address) {
        return new JettonMinterWrapper(address);
    }

    static createJettonMinterContentCell() {
        const contentCell = beginCell();

        // Writing Jetton content into the cell (metadata)
        contentCell.storeUint(0x00, 8);  // Set a prefix (used for basic content serialization)

        // Storing Jetton metadata (example for name, symbol, description, etc.)
        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field (0 indicates it's a simple text)
            .storeStringTail("AlvinJetton")  // Token name
            .endCell());

        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("AlvinJT")  // Token symbol
            .endCell());

        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("alvin demo Jetton token.")  // Token description
            .endCell());

        // Optionally, add other metadata such as image, URL, or decimals.
        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("https://tomo-chains-photo.s3.us-west-1.amazonaws.com/op.svg")  // Token image URL
            .endCell());

        return contentCell.endCell();  // Complete the cell creation and return it
    }

    static createWTonMinterContentCell() {
        const contentCell = beginCell();

        // Writing Jetton content into the cell (metadata)
        contentCell.storeUint(0x00, 8);  // Set a prefix (used for basic content serialization)

        // Storing Jetton metadata (example for name, symbol, description, etc.)
        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field (0 indicates it's a simple text)
            .storeStringTail("AlvinTon")  // Token name
            .endCell());

        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("ATon")  // Token symbol
            .endCell());

        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("alvin demo wrapper ton token.")  // Token description
            .endCell());

        // Optionally, add other metadata such as image, URL, or decimals.
        contentCell.storeRef(beginCell()
            .storeUint(0, 8)  // Text field
            .storeStringTail("https://tomo-chains-photo.s3.us-west-1.amazonaws.com/op.svg")  // Token image URL
            .endCell());

        return contentCell.endCell();  // Complete the cell creation and return it
    }

    static createFromConfig(config: JettonMinterConfig, code: Cell, workchain = 0) {
        const data = jettonMinterConfigToCell(config);
        const init = {code, data};
        return new JettonMinterWrapper(contractAddress(workchain, init), init);
    }

    static mintMessage(
        to_address: Address,
        internal_transfer_for_mint_msg_value: bigint,
        jetton_amount: bigint,
        response_address: Address,
        query_id: number | bigint = 0
    ) {

        return beginCell()
            .storeUint(Op.mint, 32)
            .storeUint(query_id, 64) // op, queryId
            .storeAddress(to_address)
            .storeCoins(internal_transfer_for_mint_msg_value)
            .storeRef(
                beginCell()
                    .storeUint(Op.internal_transfer, 32)
                    .storeUint(query_id, 64)
                    .storeCoins(jetton_amount)
                    .storeAddress(null) //from is none
                    .storeAddress(response_address) // Response addr
                    .storeCoins(0)
                    .storeMaybeRef(null)
                    .endCell()
            )
            .endCell();
    }

    /* provide_wallet_address#2c76b973 query_id:uint64 owner_address:MsgAddress include_address:Bool = InternalMsgBody;
    */
    static discoveryMessage(owner: Address, include_address: boolean) {
        return beginCell().storeUint(0x2c76b973, 32).storeUint(0, 64) // op, queryId
            .storeAddress(owner).storeBit(include_address)
            .endCell();
    }

    static changeAdminMessage(newOwner: Address) {
        return beginCell().storeUint(Op.change_admin, 32).storeUint(0, 64) // op, queryId
            .storeAddress(newOwner)
            .endCell();
    }

    static changeContentMessage(content: Cell) {
        return beginCell().storeUint(Op.change_content, 32).storeUint(0, 64) // op, queryId
            .storeRef(content)
            .endCell();
    }

    protected static jettonInternalTransfer(jetton_amount: bigint,
                                            forward_ton_amount: bigint,
                                            response_addr?: Address,
                                            query_id: number | bigint = 0) {
        return beginCell()
            .storeUint(Op.internal_transfer, 32)
            .storeUint(query_id, 64)
            .storeCoins(jetton_amount)
            .storeAddress(null)
            .storeAddress(response_addr)
            .storeCoins(forward_ton_amount)
            .storeBit(false)
            .endCell();

    }

    async sendTx(provider: ContractProvider, via: Sender, value: bigint, body: Cell) {
        await provider.internal(via, {
            value: value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: body,
        });
    }

    async sendMint(
        provider: ContractProvider,
        via: Sender,
        opts: {

            to_address: Address,
            jetton_amount: bigint,
            response_address: Address,
            internal_transfer_for_mint_msg_value?: bigint,
        }
    ) {

        let internal_transfer_for_mint_msg_value = opts.internal_transfer_for_mint_msg_value ?? toNano(0.2);

        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinterWrapper.mintMessage(
                opts.to_address,
                internal_transfer_for_mint_msg_value,
                opts.jetton_amount,
                opts.response_address,
                //no forward message there
            ),
            value: internal_transfer_for_mint_msg_value + toNano('0.2'),
        });
    }

    async sendDiscovery(provider: ContractProvider, via: Sender, owner: Address, include_address: boolean, value: bigint = toNano('0.1')) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinterWrapper.discoveryMessage(owner, include_address),
            value: value,
        });
    }

    async sendChangeAdmin(provider: ContractProvider, via: Sender, newOwner: Address) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinterWrapper.changeAdminMessage(newOwner),
            value: toNano("0.05"),
        });
    }

    async sendChangeContent(provider: ContractProvider, via: Sender, content: Cell) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: JettonMinterWrapper.changeContentMessage(content),
            value: toNano("0.05"),
        });
    }

    async sendTransferable(provider: ContractProvider, via: Sender, forAll: boolean, needCallBack: boolean) {
        await provider.internal(via, {
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell()
                .storeUint(Op.set_transferable, 32)
                .storeUint(0, 64) // op, queryId
                .storeUint(forAll ? 1 : 0, 1)
                .storeUint(needCallBack ? 1 : 0, 1)
                .storeAddress(via.address!)
                .endCell(),
            value: toNano("0.05"),
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
        let adminAddress = res.stack.readAddress();
        let content = res.stack.readCell();
        let walletCode = res.stack.readCell();
        return {
            totalSupply,
            mintable,
            adminAddress,
            content,
            walletCode,
        };
    }

    async getJettonFullData(provider: ContractProvider) {
        let res = await provider.get('get_jetton_full_data', []);
        let totalSupply = res.stack.readBigNumber();
        let mintable = res.stack.readBoolean();
        let adminAddress = res.stack.readAddress();
        let content = res.stack.readCell();
        let walletCode = res.stack.readCell();
        let transferable = res.stack.readBigNumber();
        return {
            totalSupply,
            mintable,
            adminAddress,
            content,
            walletCode,
            transferable
        };
    }

    async getTotalSupply(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.totalSupply;
    }

    async getAdminAddress(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.adminAddress;
    }

    async getContent(provider: ContractProvider) {
        let res = await this.getJettonData(provider);
        return res.content;
    }

    async getTransferable(provider: ContractProvider) {
        let res = await this.getJettonFullData(provider);
        return res.transferable;
    }
}
