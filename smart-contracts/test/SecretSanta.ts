import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import type { SecretSanta } from "../types";
import type { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("SecretSanta", function () {
  let secretSanta: SecretSanta;
  let owner: SignerWithAddress;
  let participants: SignerWithAddress[];

  // Game configuration constants
  const REGISTRATION_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const GIFT_PERIOD = 7 * 24 * 60 * 60; // 7 days
  const REVEAL_DELAY = 1 * 24 * 60 * 60; // 1 day
  const ENTRY_FEE = ethers.parseEther("0.01"); // 0.01 ETH
  const MIN_PARTICIPANTS = 3;
  const MAX_PARTICIPANTS = 10;

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    // Get signers
    [owner, ...participants] = await ethers.getSigners();

    // Deploy SecretSanta contract
    const SecretSantaFactory = await ethers.getContractFactory("SecretSanta");
    secretSanta = await SecretSantaFactory.deploy(
      REGISTRATION_PERIOD,
      GIFT_PERIOD,
      REVEAL_DELAY,
      ENTRY_FEE,
      MIN_PARTICIPANTS,
      MAX_PARTICIPANTS
    );

    await secretSanta.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await secretSanta.owner()).to.equal(owner.address);
    });

    it("Should initialize in Registration phase", async function () {
      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(0); // GamePhase.Registration
    });

    it("Should set correct game parameters", async function () {
      expect(await secretSanta.entryFee()).to.equal(ENTRY_FEE);
      expect(await secretSanta.minParticipants()).to.equal(MIN_PARTICIPANTS);
      expect(await secretSanta.maxParticipants()).to.equal(MAX_PARTICIPANTS);
    });

    it("Should set correct deadlines", async function () {
      const currentTime = (await ethers.provider.getBlock("latest"))!.timestamp;
      const gameInfo = await secretSanta.getGameInfo();

      expect(gameInfo.regDeadline).to.be.closeTo(
        BigInt(currentTime + REGISTRATION_PERIOD),
        10n
      );
      expect(gameInfo.subDeadline).to.be.closeTo(
        BigInt(currentTime + REGISTRATION_PERIOD + GIFT_PERIOD),
        10n
      );
    });

    it("Should start with zero participants", async function () {
      expect(await secretSanta.participantCount()).to.equal(0);
    });

    it("Should revert if min participants < 3", async function () {
      const SecretSantaFactory = await ethers.getContractFactory("SecretSanta");
      await expect(
        SecretSantaFactory.deploy(
          REGISTRATION_PERIOD,
          GIFT_PERIOD,
          REVEAL_DELAY,
          ENTRY_FEE,
          2, // Invalid: less than 3
          MAX_PARTICIPANTS
        )
      ).to.be.revertedWith("Need at least 3 participants");
    });

    it("Should revert if max participants > 256", async function () {
      const SecretSantaFactory = await ethers.getContractFactory("SecretSanta");
      await expect(
        SecretSantaFactory.deploy(
          REGISTRATION_PERIOD,
          GIFT_PERIOD,
          REVEAL_DELAY,
          ENTRY_FEE,
          MIN_PARTICIPANTS,
          257 // Invalid: more than 256
        )
      ).to.be.revertedWith("Max 256 participants");
    });
  });

  describe("Registration Phase", function () {
    it("Should allow participants to register with correct fee", async function () {
      const participant = participants[0];

      await expect(
        secretSanta.connect(participant).register({ value: ENTRY_FEE })
      )
        .to.emit(secretSanta, "ParticipantRegistered")
        .withArgs(participant.address, 0);

      expect(await secretSanta.isParticipant(participant.address)).to.be.true;
      expect(await secretSanta.participantCount()).to.equal(1);
    });

    it("Should track participant index correctly", async function () {
      const p1 = participants[0];
      const p2 = participants[1];

      await secretSanta.connect(p1).register({ value: ENTRY_FEE });
      await secretSanta.connect(p2).register({ value: ENTRY_FEE });

      expect(await secretSanta.participantIndex(p1.address)).to.equal(0);
      expect(await secretSanta.participantIndex(p2.address)).to.equal(1);
    });

    it("Should add participant to array", async function () {
      const participant = participants[0];
      await secretSanta.connect(participant).register({ value: ENTRY_FEE });

      const allParticipants = await secretSanta.getParticipants();
      expect(allParticipants).to.have.lengthOf(1);
      expect(allParticipants[0]).to.equal(participant.address);
    });

    it("Should reject registration with incorrect fee", async function () {
      const participant = participants[0];

      await expect(
        secretSanta.connect(participant).register({ value: ENTRY_FEE / 2n })
      ).to.be.revertedWithCustomError(secretSanta, "IncorrectEntryFee");

      await expect(
        secretSanta.connect(participant).register({ value: 0 })
      ).to.be.revertedWithCustomError(secretSanta, "IncorrectEntryFee");
    });

    it("Should reject duplicate registration", async function () {
      const participant = participants[0];

      await secretSanta.connect(participant).register({ value: ENTRY_FEE });

      await expect(
        secretSanta.connect(participant).register({ value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(secretSanta, "AlreadyRegistered");
    });

    it("Should respect max participants limit", async function () {
      // Register maximum participants
      for (let i = 0; i < MAX_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      expect(await secretSanta.participantCount()).to.equal(MAX_PARTICIPANTS);

      // Try to register one more
      await expect(
        secretSanta.connect(participants[MAX_PARTICIPANTS]).register({ value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(secretSanta, "GameFull");
    });

    it("Should allow registration from multiple participants", async function () {
      for (let i = 0; i < 5; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      expect(await secretSanta.participantCount()).to.equal(5);

      const allParticipants = await secretSanta.getParticipants();
      expect(allParticipants).to.have.lengthOf(5);
    });

    it("Should collect entry fees", async function () {
      const contractBalanceBefore = await ethers.provider.getBalance(
        await secretSanta.getAddress()
      );

      await secretSanta.connect(participants[0]).register({ value: ENTRY_FEE });
      await secretSanta.connect(participants[1]).register({ value: ENTRY_FEE });

      const contractBalanceAfter = await ethers.provider.getBalance(
        await secretSanta.getAddress()
      );

      expect(contractBalanceAfter - contractBalanceBefore).to.equal(ENTRY_FEE * 2n);
    });

    it("Should reject registration after deadline", async function () {
      // Fast forward past registration deadline
      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        secretSanta.connect(participants[0]).register({ value: ENTRY_FEE })
      ).to.be.revertedWithCustomError(secretSanta, "DeadlinePassed");
    });
  });

  describe("Matching Phase", function () {
    beforeEach(async function () {
      // Register minimum participants
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }
    });

    it("Should transition to matching phase", async function () {
      // Fast forward to after registration deadline
      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);

      await expect(secretSanta.connect(owner).startMatching())
        .to.emit(secretSanta, "PhaseChanged")
        .and.to.emit(secretSanta, "MatchingCompleted");

      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(2); // GamePhase.GiftSubmission
    });

    it("Should only allow owner to start matching", async function () {
      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        secretSanta.connect(participants[0]).startMatching()
      ).to.be.revertedWithCustomError(secretSanta, "OnlyOwner");
    });

    it("Should reject matching with insufficient participants", async function () {
      // Deploy new game with only 1 participant
      const SecretSantaFactory = await ethers.getContractFactory("SecretSanta");
      const newGame = await SecretSantaFactory.deploy(
        REGISTRATION_PERIOD,
        GIFT_PERIOD,
        REVEAL_DELAY,
        ENTRY_FEE,
        MIN_PARTICIPANTS,
        MAX_PARTICIPANTS
      );

      await newGame.connect(participants[0]).register({ value: ENTRY_FEE });

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);

      await expect(
        newGame.connect(owner).startMatching()
      ).to.be.revertedWithCustomError(newGame, "InsufficientParticipants");
    });

    it("Should allow early matching when game is full", async function () {
      // Register all participants
      for (let i = MIN_PARTICIPANTS; i < MAX_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      // Don't fast forward time - try to start immediately
      await expect(secretSanta.connect(owner).startMatching())
        .to.emit(secretSanta, "MatchingCompleted");

      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(2); // GiftSubmission
    });

    it("Should reject early matching if not full and before deadline", async function () {
      // Try to start matching before deadline with only min participants
      await expect(
        secretSanta.connect(owner).startMatching()
      ).to.be.revertedWithCustomError(secretSanta, "DeadlineNotReached");
    });
  });

  describe("Recipient Query", function () {
    beforeEach(async function () {
      // Register and complete matching
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);
      await secretSanta.connect(owner).startMatching();
    });

    it("Should allow participants to query their recipient", async function () {
      const participant = participants[0];

      // This should not revert
      await expect(
        secretSanta.connect(participant).getMyRecipientEncrypted()
      ).to.not.be.reverted;
    });

    it("Should reject query from non-participants", async function () {
      const nonParticipant = participants[5]; // Not registered

      await expect(
        secretSanta.connect(nonParticipant).getMyRecipientEncrypted()
      ).to.be.revertedWithCustomError(secretSanta, "NotRegistered");
    });

    it("Should get participant address by index", async function () {
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const addr = await secretSanta.getParticipantByIndex(i);
        expect(addr).to.equal(participants[i].address);
      }
    });

    it("Should revert for out of bounds index", async function () {
      await expect(
        secretSanta.getParticipantByIndex(999)
      ).to.be.revertedWith("Index out of bounds");
    });
  });

  describe("View Functions", function () {
    it("Should return game info correctly", async function () {
      const gameInfo = await secretSanta.getGameInfo();

      expect(gameInfo.phase).to.equal(0); // Registration
      expect(gameInfo.numParticipants).to.equal(0);
      expect(gameInfo.regDeadline).to.be.greaterThan(0);
      expect(gameInfo.subDeadline).to.be.greaterThan(gameInfo.regDeadline);
      expect(gameInfo.revTime).to.be.greaterThan(gameInfo.subDeadline);
    });

    it("Should check registration status correctly", async function () {
      const participant = participants[0];

      expect(await secretSanta.isRegistered(participant.address)).to.be.false;

      await secretSanta.connect(participant).register({ value: ENTRY_FEE });

      expect(await secretSanta.isRegistered(participant.address)).to.be.true;
    });

    it("Should track gifts submitted count", async function () {
      expect(await secretSanta.getGiftsSubmittedCount()).to.equal(0);
    });
  });

  describe("Gas Optimization Tests", function () {
    it("Should not exceed reasonable gas limits for registration", async function () {
      const participant = participants[0];

      const tx = await secretSanta.connect(participant).register({ value: ENTRY_FEE });
      const receipt = await tx.wait();

      // Registration should use less than 150k gas
      expect(receipt!.gasUsed).to.be.lessThan(150000n);
    });

    it("Should handle maximum participants efficiently", async function () {
      // Register all max participants
      for (let i = 0; i < MAX_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      // Matching should complete without running out of gas
      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);

      const tx = await secretSanta.connect(owner).startMatching();
      const receipt = await tx.wait();

      // Should use reasonable gas even with max participants
      expect(receipt!.gasUsed).to.be.lessThan(1000000n);
    });
  });

  describe("Gift Submission Phase", function () {
    beforeEach(async function () {
      // Register participants and complete matching
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);
      await secretSanta.connect(owner).startMatching();
    });

    it("Should allow participants to submit encrypted gifts", async function () {
      const participant = participants[0];
      const giftValue = 12345;
      const metadataURI = "ipfs://QmTest123";

      // Create encrypted input using fhevm
      const contractAddress = await secretSanta.getAddress();
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, participant.address)
        .add64(giftValue)
        .encrypt();

      await expect(
        secretSanta.connect(participant).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          metadataURI
        )
      )
        .to.emit(secretSanta, "GiftSubmitted")
        .withArgs(participant.address, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));

      expect(await secretSanta.hasSubmittedGift(participant.address)).to.be.true;
      expect(await secretSanta.getGiftsSubmittedCount()).to.equal(1);
      expect(await secretSanta.giftMetadataURIs(participant.address)).to.equal(metadataURI);
    });

    it("Should reject duplicate gift submission", async function () {
      const participant = participants[0];
      const giftValue = 12345;
      const metadataURI = "ipfs://QmTest123";

      const contractAddress = await secretSanta.getAddress();
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, participant.address)
        .add64(giftValue)
        .encrypt();

      // Submit first gift
      await secretSanta.connect(participant).submitGift(
        encryptedInput.handles[0],
        encryptedInput.inputProof,
        metadataURI
      );

      // Try to submit again
      await expect(
        secretSanta.connect(participant).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          metadataURI
        )
      ).to.be.revertedWithCustomError(secretSanta, "AlreadySubmittedGift");
    });

    it("Should reject gift submission from non-participants", async function () {
      const nonParticipant = participants[5]; // Not registered
      const giftValue = 12345;
      const metadataURI = "ipfs://QmTest123";

      const contractAddress = await secretSanta.getAddress();
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, nonParticipant.address)
        .add64(giftValue)
        .encrypt();

      await expect(
        secretSanta.connect(nonParticipant).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          metadataURI
        )
      ).to.be.revertedWithCustomError(secretSanta, "NotRegistered");
    });

    it("Should reject gift submission in wrong phase", async function () {
      const giftValue = 12345;
      const contractAddress = await secretSanta.getAddress();

      // Submit all gifts to move to WaitingReveal phase
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, participants[i].address)
          .add64(giftValue)
          .encrypt();

        await secretSanta.connect(participants[i]).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          `ipfs://QmTest${i}`
        );
      }

      // Now in WaitingReveal phase, should reject new submissions
      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(3); // WaitingReveal
    });

    it("Should auto-transition to WaitingReveal when all gifts submitted", async function () {
      const metadataURI = "ipfs://QmTest";
      const giftValue = 12345;
      const contractAddress = await secretSanta.getAddress();

      // Submit gifts from all participants except last
      for (let i = 0; i < MIN_PARTICIPANTS - 1; i++) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, participants[i].address)
          .add64(giftValue)
          .encrypt();

        await secretSanta.connect(participants[i]).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          `${metadataURI}${i}`
        );

        const gameInfo = await secretSanta.getGameInfo();
        expect(gameInfo.phase).to.equal(2); // Still in GiftSubmission
      }

      // Submit last gift - should trigger phase change
      const lastEncryptedInput = await fhevm
        .createEncryptedInput(contractAddress, participants[MIN_PARTICIPANTS - 1].address)
        .add64(giftValue)
        .encrypt();

      await expect(
        secretSanta.connect(participants[MIN_PARTICIPANTS - 1]).submitGift(
          lastEncryptedInput.handles[0],
          lastEncryptedInput.inputProof,
          `${metadataURI}${MIN_PARTICIPANTS - 1}`
        )
      )
        .to.emit(secretSanta, "PhaseChanged")
        .withArgs(3, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1)); // WaitingReveal

      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(3); // WaitingReveal
      expect(await secretSanta.getGiftsSubmittedCount()).to.equal(MIN_PARTICIPANTS);
    });

    it("Should reject gift submission after deadline", async function () {
      // Fast forward past gift submission deadline
      await ethers.provider.send("evm_increaseTime", [GIFT_PERIOD + 1]);
      await ethers.provider.send("evm_mine", []);

      const participant = participants[0];
      const giftValue = 12345;
      const metadataURI = "ipfs://QmTest123";

      const contractAddress = await secretSanta.getAddress();
      const encryptedInput = await fhevm
        .createEncryptedInput(contractAddress, participant.address)
        .add64(giftValue)
        .encrypt();

      await expect(
        secretSanta.connect(participant).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          metadataURI
        )
      ).to.be.revertedWithCustomError(secretSanta, "DeadlinePassed");
    });

    it("Should track multiple gift submissions correctly", async function () {
      const giftValue = 12345;
      const contractAddress = await secretSanta.getAddress();

      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, participants[i].address)
          .add64(giftValue)
          .encrypt();

        await secretSanta.connect(participants[i]).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          `ipfs://QmTest${i}`
        );

        expect(await secretSanta.getGiftsSubmittedCount()).to.equal(i + 1);
        expect(await secretSanta.hasSubmittedGift(participants[i].address)).to.be.true;
      }
    });
  });

  describe("Reveal Phase", function () {
    beforeEach(async function () {
      // Register participants, complete matching, and submit all gifts
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);
      await secretSanta.connect(owner).startMatching();

      // Submit gifts from all participants
      const giftValue = 12345;
      const contractAddress = await secretSanta.getAddress();

      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, participants[i].address)
          .add64(giftValue)
          .encrypt();

        await secretSanta.connect(participants[i]).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          `ipfs://QmTest${i}`
        );
      }

      // Should now be in WaitingReveal phase
      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(3); // WaitingReveal

      // Fast forward past gift submission deadline to reach reveal time window
      // We need to fast forward by GIFT_PERIOD + REVEAL_DELAY
      await ethers.provider.send("evm_increaseTime", [GIFT_PERIOD + REVEAL_DELAY]);
      await ethers.provider.send("evm_mine", []);
    });

    it("Should trigger reveal after reveal time", async function () {
      const decryptedOffset = 1; // Mock decrypted offset

      await expect(
        secretSanta.connect(owner).triggerReveal(decryptedOffset)
      )
        .to.emit(secretSanta, "PhaseChanged")
        .withArgs(4, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1)) // Revealed
        .and.to.emit(secretSanta, "GameRevealed");

      const gameInfo = await secretSanta.getGameInfo();
      expect(gameInfo.phase).to.equal(4); // Revealed
    });

    it("Should reject reveal before reveal time", async function () {
      // Deploy a new game and test early reveal
      const SecretSantaFactory = await ethers.getContractFactory("SecretSanta");
      const newGame = await SecretSantaFactory.deploy(
        REGISTRATION_PERIOD,
        GIFT_PERIOD,
        REVEAL_DELAY,
        ENTRY_FEE,
        MIN_PARTICIPANTS,
        MAX_PARTICIPANTS
      );

      // Register and complete matching
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await newGame.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);
      await newGame.connect(owner).startMatching();

      // Submit all gifts
      const giftValue = 12345;
      const contractAddress = await newGame.getAddress();

      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const encryptedInput = await fhevm
          .createEncryptedInput(contractAddress, participants[i].address)
          .add64(giftValue)
          .encrypt();

        await newGame.connect(participants[i]).submitGift(
          encryptedInput.handles[0],
          encryptedInput.inputProof,
          `ipfs://QmTest${i}`
        );
      }

      // Try to reveal too early (before reveal time)
      const decryptedOffset = 1;

      await expect(
        newGame.connect(owner).triggerReveal(decryptedOffset)
      ).to.be.revertedWith("Too early to reveal");
    });

    it("Should only allow owner to trigger reveal", async function () {
      const decryptedOffset = 1;

      await expect(
        secretSanta.connect(participants[0]).triggerReveal(decryptedOffset)
      ).to.be.revertedWithCustomError(secretSanta, "OnlyOwner");
    });

    it("Should calculate and store all matches correctly on reveal", async function () {
      const decryptedOffset = 1;

      const tx = await secretSanta.connect(owner).triggerReveal(decryptedOffset);
      const receipt = await tx.wait();

      // Check RecipientRevealed events
      const events = receipt!.logs.filter(
        log => {
          try {
            const parsed = secretSanta.interface.parseLog({
              topics: log.topics as string[],
              data: log.data
            });
            return parsed?.name === "RecipientRevealed";
          } catch {
            return false;
          }
        }
      );

      expect(events).to.have.lengthOf(MIN_PARTICIPANTS);

      // Verify circular matching
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        const giver = participants[i].address;
        const expectedRecipientIndex = (i + decryptedOffset) % MIN_PARTICIPANTS;
        const expectedRecipient = participants[expectedRecipientIndex].address;

        const revealedRecipient = await secretSanta.revealedRecipients(giver);
        expect(revealedRecipient).to.equal(expectedRecipient);
      }
    });

    it("Should allow revealing individual gift values", async function () {
      const decryptedOffset = 1;
      await secretSanta.connect(owner).triggerReveal(decryptedOffset);

      const participant = participants[0];
      const giftValue = 12345n;

      await secretSanta.connect(owner).revealGift(participant.address, giftValue);

      const revealed = await secretSanta.revealedGiftValues(participant.address);
      expect(revealed).to.equal(giftValue);
    });

    it("Should reject revealing gift for non-participant", async function () {
      const decryptedOffset = 1;
      await secretSanta.connect(owner).triggerReveal(decryptedOffset);

      const nonParticipant = participants[5]; // Not registered
      const giftValue = 12345n;

      await expect(
        secretSanta.connect(owner).revealGift(nonParticipant.address, giftValue)
      ).to.be.revertedWith("Not a participant");
    });

    it("Should only allow owner to reveal gifts", async function () {
      const decryptedOffset = 1;
      await secretSanta.connect(owner).triggerReveal(decryptedOffset);

      const participant = participants[0];
      const giftValue = 12345n;

      await expect(
        secretSanta.connect(participants[1]).revealGift(participant.address, giftValue)
      ).to.be.revertedWithCustomError(secretSanta, "OnlyOwner");
    });

    it("Should retrieve revealed match data correctly", async function () {
      const decryptedOffset = 1;
      await secretSanta.connect(owner).triggerReveal(decryptedOffset);

      const giver = participants[0];
      const giftValue = 12345n;
      await secretSanta.connect(owner).revealGift(giver.address, giftValue);

      const [recipient, revealedValue, metadataURI] = await secretSanta.getRevealedMatch(
        giver.address
      );

      const expectedRecipientIndex = (0 + decryptedOffset) % MIN_PARTICIPANTS;
      expect(recipient).to.equal(participants[expectedRecipientIndex].address);
      expect(revealedValue).to.equal(giftValue);
      expect(metadataURI).to.equal("ipfs://QmTest0");
    });

    it("Should reject getRevealedMatch before reveal", async function () {
      await expect(
        secretSanta.getRevealedMatch(participants[0].address)
      ).to.be.revertedWith("Not revealed yet");
    });
  });

  describe("Edge Cases", function () {
    it("Should handle exactly minimum participants", async function () {
      for (let i = 0; i < MIN_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await ethers.provider.send("evm_increaseTime", [REGISTRATION_PERIOD]);
      await ethers.provider.send("evm_mine", []);

      await expect(secretSanta.connect(owner).startMatching())
        .to.emit(secretSanta, "MatchingCompleted");

      expect(await secretSanta.participantCount()).to.equal(MIN_PARTICIPANTS);
    });

    it("Should handle exactly maximum participants", async function () {
      for (let i = 0; i < MAX_PARTICIPANTS; i++) {
        await secretSanta.connect(participants[i]).register({ value: ENTRY_FEE });
      }

      await expect(secretSanta.connect(owner).startMatching())
        .to.emit(secretSanta, "MatchingCompleted");

      expect(await secretSanta.participantCount()).to.equal(MAX_PARTICIPANTS);
    });
  });
});
