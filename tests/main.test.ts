import { startAnchor } from "solana-bankrun";
import { BankrunProvider } from "anchor-bankrun";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BN, Program } from "@coral-xyz/anchor";
import { IDL as PuppetIDL, Puppet } from "./anchor-example/puppet";

const PUPPET_PROGRAM_ID = new PublicKey(
	"Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS",
);

test("anchor", async () => {
	const context = await startAnchor("tests/anchor-example", [], []);

	const provider = new BankrunProvider(context);

	const puppetProgram = new Program<Puppet>(
		PuppetIDL,
		PUPPET_PROGRAM_ID,
		provider,
	);

        const dataKeypair = Keypair.generate();

	const ix = await puppetProgram.account.data.createInstruction(
		dataKeypair,
		1000,
	);
        console.log(ix);

	const puppetKeypair = Keypair.generate();
	await puppetProgram.methods
		.initialize()
                .preInstructions([ix])
		.accounts({
			puppet: puppetKeypair.publicKey,
		})
		.signers([puppetKeypair, dataKeypair])
		.rpc();

        /* console.log(puppetProgram); */

        let connection = puppetProgram.provider.connection;

        console.log(await connection.getAccountInfoAndContext(dataKeypair.publicKey));

	const data = new BN(123456);
	await puppetProgram.methods
		.setData(data)
		.accounts({
			puppet: puppetKeypair.publicKey,
		})
		.rpc();

	const dataAccount = await puppetProgram.account.data.fetch(
		puppetKeypair.publicKey,
	);
	expect(dataAccount.data.eq(new BN(123456)));
});
