// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EducationPlatform {
    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        address teacher;
    }

    struct Stake {
        uint256 amount;
        uint256 timestamp;
    }

    uint256 private nextCourseId;
    mapping(uint256 => Course) private courses; // Maps course ID to Course
    mapping(address => uint256[]) private purchasedCourses; // Maps learner to their purchased courses
    mapping(address => Stake) private stakes; // Maps learner to their staking information
    uint256 public rewardRate = 1; // Reward rate per second for staking

    event CourseCreated(uint256 courseId, string title, address teacher);
    event CourseBought(uint256 courseId, address learner);
    event CourseDeleted(uint256 courseId, address learner);
    event TokensStaked(address learner, uint256 amount);
    event TokensUnstaked(address learner, uint256 amount, uint256 rewards);

    // Create a new course (for teachers)
    function createCourse(
        string memory _title,
        string memory _description,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _price
    ) external {
        require(_startTime < _endTime, "Start time must be before end time");

        uint256 courseId = nextCourseId;
        nextCourseId++;

        courses[courseId] = Course({
            id: courseId,
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            price: _price,
            teacher: msg.sender
        });

        emit CourseCreated(courseId, _title, msg.sender);
    }

    // Buy a course (learners)
    function buyCourse(uint256 _courseId) external payable {
        Course storage course = courses[_courseId];
        require(course.id != 0, "Course does not exist");
        require(msg.value == course.price, "Incorrect payment amount");

        purchasedCourses[msg.sender].push(_courseId);

        emit CourseBought(_courseId, msg.sender);
    }

    // Delete a purchased course (learners)
    function deletePurchasedCourse(uint256 _courseId) external {
        uint256[] storage learnerCourses = purchasedCourses[msg.sender];
        bool found = false;

        for (uint256 i = 0; i < learnerCourses.length; i++) {
            if (learnerCourses[i] == _courseId) {
                learnerCourses[i] = learnerCourses[learnerCourses.length - 1];
                learnerCourses.pop();
                found = true;
                break;
            }
        }

        require(found, "Course not found in your purchased list");

        emit CourseDeleted(_courseId, msg.sender);
    }

    // Get all purchased courses (learners)
    function getPurchasedCourses() external view returns (Course[] memory) {
        uint256[] memory learnerCourses = purchasedCourses[msg.sender];
        Course[] memory myCourses = new Course[](learnerCourses.length);

        for (uint256 i = 0; i < learnerCourses.length; i++) {
            myCourses[i] = courses[learnerCourses[i]];
        }

        return myCourses;
    }

    // Stake tokens (learners)
    function stakeTokens() external payable {
        require(msg.value > 0, "Stake amount must be greater than zero");

        Stake storage stake = stakes[msg.sender];
        if (stake.amount > 0) {
            uint256 rewards = calculateRewards(msg.sender);
            stake.amount += msg.value;
            stake.timestamp = block.timestamp;
        } else {
            stakes[msg.sender] = Stake({
                amount: msg.value,
                timestamp: block.timestamp
            });
        }

        emit TokensStaked(msg.sender, msg.value);
    }

    // Unstake tokens and claim rewards (learners)
    function unstakeTokens() external {
        Stake storage stake = stakes[msg.sender];
        require(stake.amount > 0, "No tokens staked");

        uint256 rewards = calculateRewards(msg.sender);
        uint256 totalAmount = stake.amount + rewards;

        delete stakes[msg.sender];

        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit TokensUnstaked(msg.sender, stake.amount, rewards);
    }

    // Get staked amount and rewards for a learner
    function getStakeDetails() external view returns (uint256 stakedAmount, uint256 rewards) {
        Stake storage stake = stakes[msg.sender];
        stakedAmount = stake.amount;
        rewards = calculateRewards(msg.sender);
    }

    // Internal function to calculate staking rewards
    function calculateRewards(address _learner) internal view returns (uint256) {
        Stake storage stake = stakes[_learner];
        if (stake.amount == 0) {
            return 0;
        }

        uint256 duration = block.timestamp - stake.timestamp;
        return (stake.amount * rewardRate * duration) / 1 ether;
    }
}
