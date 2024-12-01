// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Instructor {
    struct Course {
        uint256 id;
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        uint256 price;
        address teacher;
    }

    uint256 private nextCourseId;
    mapping(uint256 => Course) private courses;
    mapping(address => uint256[]) private teacherCourses;
    mapping(uint256 => mapping(address => bool)) private enrolledStudents;

    event CourseCreated(uint256 courseId, string title, address teacher);
    event CourseDeleted(uint256 courseId, address teacher);
    event StudentEnrolled(uint256 courseId, address student);

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

        teacherCourses[msg.sender].push(courseId);
        emit CourseCreated(courseId, _title, msg.sender);
    }

    function deleteCourse(uint256 _courseId) external {
        Course storage course = courses[_courseId];
        require(course.teacher == msg.sender, "Only the teacher can delete this course");

        // Remove the course from teacherCourses
        uint256[] storage teacherCourseList = teacherCourses[msg.sender];
        for (uint256 i = 0; i < teacherCourseList.length; i++) {
            if (teacherCourseList[i] == _courseId) {
                teacherCourseList[i] = teacherCourseList[teacherCourseList.length - 1];
                teacherCourseList.pop();
                break;
            }
        }

        delete courses[_courseId];
        emit CourseDeleted(_courseId, msg.sender);
    }

    function getMyCourses(address _instructor) external view returns (Course[] memory) {
        uint256[] memory courseIds = teacherCourses[_instructor];
        Course[] memory myCourses = new Course[](courseIds.length);

        for (uint256 i = 0; i < courseIds.length; i++) {
            myCourses[i] = courses[courseIds[i]];
        }

        return myCourses;
    }
}