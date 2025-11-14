// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint8, euint32, euint64, ebool, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title SecretSanta
 * @notice A privacy-preserving Secret Santa gift exchange game using Fully Homomorphic Encryption
 * @dev Uses FHEVM to encrypt participant matching, ensuring true privacy until reveal phase
 *
 * Game Flow:
 * 1. Registration: Participants pay entry fee and join
 * 2. Matching: Admin triggers encrypted circular matching algorithm
 * 3. GiftSubmission: Participants submit encrypted gifts
 * 4. WaitingReveal: All gifts submitted, waiting for reveal time
 * 5. Revealed: Matches and gifts become public
 */
contract SecretSanta is EthereumConfig {
    // ========================================
    // TYPE DEFINITIONS
    // ========================================

    enum GamePhase {
        Registration,    // Players can join
        Matching,        // Admin is generating matches
        GiftSubmission,  // Players submit gifts
        WaitingReveal,   // All gifts in, waiting for reveal
        Revealed         // Everything is public
    }

    // ========================================
    // STATE VARIABLES
    // ========================================

    // Game configuration
    address public immutable owner;
    uint256 public immutable registrationDeadline;
    uint256 public immutable giftSubmissionDeadline;
    uint256 public immutable revealTime;
    uint256 public immutable entryFee;
    uint256 public immutable minParticipants;
    uint256 public immutable maxParticipants;

    // Current game state
    GamePhase public currentPhase;

    // Participants
    address[] public participants;
    mapping(address => uint256) public participantIndex;
    mapping(address => bool) public isParticipant;
    uint256 public participantCount;

    // Encrypted matching data
    euint32 private encryptedMatchingOffset;
    bool private matchingGenerated;

    // Gift submission tracking
    mapping(address => euint64) private encryptedGiftValues;
    mapping(address => string) public giftMetadataURIs;
    mapping(address => bool) public hasSubmittedGift;
    uint256 public giftsSubmittedCount;

    // Revealed data (only populated after reveal)
    mapping(address => address) public revealedRecipients;
    mapping(address => uint64) public revealedGiftValues;
    uint32 private revealedOffset;

    // ========================================
    // EVENTS
    // ========================================

    event ParticipantRegistered(address indexed participant, uint256 index);
    event PhaseChanged(GamePhase newPhase, uint256 timestamp);
    event MatchingCompleted(uint256 timestamp);
    event GiftSubmitted(address indexed giver, uint256 timestamp);
    event GameRevealed(uint256 timestamp);
    event RecipientRevealed(address indexed giver, address indexed recipient);

    // ========================================
    // ERRORS
    // ========================================

    error OnlyOwner();
    error InvalidPhase();
    error DeadlinePassed();
    error DeadlineNotReached();
    error AlreadyRegistered();
    error NotRegistered();
    error GameFull();
    error IncorrectEntryFee();
    error InsufficientParticipants();
    error AlreadySubmittedGift();
    error NotEnoughParticipants();

    // ========================================
    // MODIFIERS
    // ========================================

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    modifier inPhase(GamePhase phase) {
        if (currentPhase != phase) revert InvalidPhase();
        _;
    }

    modifier onlyParticipant() {
        if (!isParticipant[msg.sender]) revert NotRegistered();
        _;
    }

    // ========================================
    // CONSTRUCTOR
    // ========================================

    /**
     * @notice Initialize a new Secret Santa game
     * @param _registrationPeriod Duration of registration phase in seconds
     * @param _giftSubmissionPeriod Duration of gift submission phase in seconds
     * @param _revealDelay Time to wait after all gifts submitted before reveal
     * @param _entryFee Amount of ETH required to join (in wei)
     * @param _minParticipants Minimum number of participants required
     * @param _maxParticipants Maximum number of participants allowed
     */
    constructor(
        uint256 _registrationPeriod,
        uint256 _giftSubmissionPeriod,
        uint256 _revealDelay,
        uint256 _entryFee,
        uint256 _minParticipants,
        uint256 _maxParticipants
    ) {
        require(_minParticipants >= 3, "Need at least 3 participants");
        require(_maxParticipants <= 256, "Max 256 participants"); // euint8 limit
        require(_minParticipants <= _maxParticipants, "Invalid participant limits");

        owner = msg.sender;
        registrationDeadline = block.timestamp + _registrationPeriod;
        giftSubmissionDeadline = registrationDeadline + _giftSubmissionPeriod;
        revealTime = giftSubmissionDeadline + _revealDelay;
        entryFee = _entryFee;
        minParticipants = _minParticipants;
        maxParticipants = _maxParticipants;
        currentPhase = GamePhase.Registration;

        emit PhaseChanged(GamePhase.Registration, block.timestamp);
    }

    // ========================================
    // REGISTRATION PHASE
    // ========================================

    /**
     * @notice Register to participate in the Secret Santa game
     * @dev Must send exact entry fee. Can only register once.
     */
    function register() external payable inPhase(GamePhase.Registration) {
        if (block.timestamp >= registrationDeadline) revert DeadlinePassed();
        if (isParticipant[msg.sender]) revert AlreadyRegistered();
        if (participantCount >= maxParticipants) revert GameFull();
        if (msg.value != entryFee) revert IncorrectEntryFee();

        // Add participant
        participants.push(msg.sender);
        participantIndex[msg.sender] = participantCount;
        isParticipant[msg.sender] = true;
        participantCount++;

        emit ParticipantRegistered(msg.sender, participantCount - 1);
    }

    /**
     * @notice Get all registered participants
     * @return Array of participant addresses
     */
    function getParticipants() external view returns (address[] memory) {
        return participants;
    }

    // ========================================
    // MATCHING PHASE
    // ========================================

    /**
     * @notice Start the matching phase and generate encrypted matches
     * @dev Can only be called by owner after registration deadline or when game is full
     */
    function startMatching() external onlyOwner inPhase(GamePhase.Registration) {
        if (block.timestamp < registrationDeadline && participantCount < maxParticipants) {
            revert DeadlineNotReached();
        }
        if (participantCount < minParticipants) revert InsufficientParticipants();

        currentPhase = GamePhase.Matching;
        emit PhaseChanged(GamePhase.Matching, block.timestamp);

        _generateMatches();

        currentPhase = GamePhase.GiftSubmission;
        emit PhaseChanged(GamePhase.GiftSubmission, block.timestamp);
        emit MatchingCompleted(block.timestamp);
    }

    /**
     * @notice Generate encrypted circular matches using random offset
     * @dev Uses FHE to ensure matches remain secret until reveal
     *
     * Algorithm:
     * 1. Generate random encrypted offset (euint32)
     * 2. Ensure offset != 0 (prevent self-matching)
     * 3. Take modulo with participantCount to fit in range
     * 4. Each participant i gives to (i + offset) % participantCount
     */
    function _generateMatches() private {
        require(!matchingGenerated, "Matches already generated");

        // Generate random encrypted offset
        euint32 rawOffset = FHE.randEuint32();

        // Take modulo with participantCount (plaintext) to fit in valid range [0, participantCount-1]
        euint32 offsetMod = FHE.rem(rawOffset, uint32(participantCount));

        // If offset is 0, set it to 1 (prevent self-matching)
        // This ensures offset is in range [1, participantCount-1]
        euint32 zero = FHE.asEuint32(0);
        euint32 one = FHE.asEuint32(1);
        ebool isZero = FHE.eq(offsetMod, zero);

        encryptedMatchingOffset = FHE.select(isZero, one, offsetMod);
        matchingGenerated = true;

        // Allow ACL for future operations
        FHE.allowThis(encryptedMatchingOffset);
    }

    /**
     * @notice Calculate next power of 2 greater than or equal to n
     * @dev Used for random number generation bounds
     */
    function _nextPowerOfTwo(uint256 n) private pure returns (uint256) {
        if (n == 0) return 1;
        n--;
        n |= n >> 1;
        n |= n >> 2;
        n |= n >> 4;
        n |= n >> 8;
        n |= n >> 16;
        n |= n >> 32;
        return n + 1;
    }

    // ========================================
    // RECIPIENT QUERY
    // ========================================

    /**
     * @notice Get your encrypted recipient index
     * @dev Returns encrypted value that caller can decrypt locally
     * @return Encrypted index of the participant you should give a gift to
     */
    function getMyRecipientEncrypted()
        external
        onlyParticipant
        returns (euint32)
    {
        require(matchingGenerated, "Matching not yet generated");
        require(
            currentPhase == GamePhase.GiftSubmission ||
            currentPhase == GamePhase.WaitingReveal,
            "Cannot query recipient in this phase"
        );

        uint256 myIndex = participantIndex[msg.sender];
        euint32 myIndexEnc = FHE.asEuint32(uint32(myIndex));

        // Calculate (myIndex + offset) % participantCount
        euint32 sum = FHE.add(myIndexEnc, encryptedMatchingOffset);
        euint32 recipientIndex = FHE.rem(sum, uint32(participantCount));

        // Allow caller to decrypt this value
        FHE.allow(recipientIndex, msg.sender);

        return recipientIndex;
    }

    /**
     * @notice Get recipient address by index (public view)
     * @param index Participant index
     * @return Address of participant at that index
     */
    function getParticipantByIndex(uint256 index) external view returns (address) {
        require(index < participantCount, "Index out of bounds");
        return participants[index];
    }

    // ========================================
    // GIFT SUBMISSION PHASE
    // ========================================

    /**
     * @notice Submit your encrypted gift
     * @param encryptedGiftValue Encrypted gift value (from frontend)
     * @param inputProof Proof for encrypted input
     * @param giftMetadataURI IPFS URI for gift metadata
     */
    function submitGift(
        externalEuint64 encryptedGiftValue,
        bytes calldata inputProof,
        string calldata giftMetadataURI
    )
        external
        onlyParticipant
        inPhase(GamePhase.GiftSubmission)
    {
        if (block.timestamp >= giftSubmissionDeadline) revert DeadlinePassed();
        if (hasSubmittedGift[msg.sender]) revert AlreadySubmittedGift();

        // Convert encrypted input to internal type
        euint64 giftValue = FHE.fromExternal(encryptedGiftValue, inputProof);

        // Store encrypted gift data
        encryptedGiftValues[msg.sender] = giftValue;
        giftMetadataURIs[msg.sender] = giftMetadataURI;
        hasSubmittedGift[msg.sender] = true;
        giftsSubmittedCount++;

        // Allow this contract to access the value for potential future operations
        FHE.allowThis(giftValue);
        FHE.allow(giftValue, msg.sender);

        emit GiftSubmitted(msg.sender, block.timestamp);

        // Check if all gifts submitted
        if (giftsSubmittedCount == participantCount) {
            currentPhase = GamePhase.WaitingReveal;
            emit PhaseChanged(GamePhase.WaitingReveal, block.timestamp);
        }
    }

    // ========================================
    // REVEAL PHASE
    // ========================================

    /**
     * @notice Trigger the reveal process (owner manually sets offset)
     * @dev In production, this would use Gateway decryption callbacks
     * @param decryptedOffset The manually decrypted offset value
     *
     * NOTE: This is a simplified version for testing purposes.
     * Production implementation would use Gateway.requestDecryption()
     * and receive the decrypted value via callback.
     */
    function triggerReveal(uint32 decryptedOffset) external onlyOwner {
        require(
            currentPhase == GamePhase.WaitingReveal,
            "Not ready for reveal"
        );
        require(
            block.timestamp >= revealTime,
            "Too early to reveal"
        );

        currentPhase = GamePhase.Revealed;
        emit PhaseChanged(GamePhase.Revealed, block.timestamp);

        revealedOffset = decryptedOffset;

        // Calculate all matches and store them
        for (uint256 i = 0; i < participantCount; i++) {
            address giver = participants[i];
            uint256 recipientIndex = (i + decryptedOffset) % participantCount;
            address recipient = participants[recipientIndex];

            revealedRecipients[giver] = recipient;

            emit RecipientRevealed(giver, recipient);
        }

        emit GameRevealed(block.timestamp);
    }

    /**
     * @notice Reveal a specific participant's gift value (owner only)
     * @dev Used to manually set revealed gift values after decryption
     * @param participant Address of the participant
     * @param giftValue Decrypted gift value
     *
     * NOTE: This is a simplified version for testing purposes.
     * Production would decrypt all gifts atomically via Gateway callback.
     */
    function revealGift(address participant, uint64 giftValue) external onlyOwner {
        require(currentPhase == GamePhase.Revealed, "Not in reveal phase");
        require(isParticipant[participant], "Not a participant");

        revealedGiftValues[participant] = giftValue;
    }

    // ========================================
    // VIEW FUNCTIONS
    // ========================================

    /**
     * @notice Get revealed match for a giver
     * @param giver Address of the gift giver
     * @return recipient Address who receives the gift
     * @return giftValue Value of the gift
     * @return metadataURI IPFS URI of gift metadata
     */
    function getRevealedMatch(address giver)
        external
        view
        returns (
            address recipient,
            uint64 giftValue,
            string memory metadataURI
        )
    {
        require(currentPhase == GamePhase.Revealed, "Not revealed yet");
        return (
            revealedRecipients[giver],
            revealedGiftValues[giver],
            giftMetadataURIs[giver]
        );
    }

    /**
     * @notice Get comprehensive game information
     * @return phase Current game phase
     * @return numParticipants Number of registered participants
     * @return regDeadline Registration deadline timestamp
     * @return subDeadline Gift submission deadline timestamp
     * @return revTime Reveal time timestamp
     */
    function getGameInfo()
        external
        view
        returns (
            GamePhase phase,
            uint256 numParticipants,
            uint256 regDeadline,
            uint256 subDeadline,
            uint256 revTime
        )
    {
        return (
            currentPhase,
            participantCount,
            registrationDeadline,
            giftSubmissionDeadline,
            revealTime
        );
    }

    /**
     * @notice Check if a specific address is registered
     * @param addr Address to check
     * @return Whether address is a participant
     */
    function isRegistered(address addr) external view returns (bool) {
        return isParticipant[addr];
    }

    /**
     * @notice Get number of gifts submitted so far
     * @return Number of gifts submitted
     */
    function getGiftsSubmittedCount() external view returns (uint256) {
        return giftsSubmittedCount;
    }
}
