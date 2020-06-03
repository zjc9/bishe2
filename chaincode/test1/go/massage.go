package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// 智能合约
type SmartContract struct {
	contractapi.Contract
}

// 学生信息结构体
type Student struct {
	Name   string `json:"stu_name"`
	ID  string `json:"stu_id"`
	Class string `json:"stu_class"`
	Password  string `json:"password"`
	Term string `json:"term"`
}

//返回的结果
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Student
}

// 初始化
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	students := []Student{
		Student{Name: "张久成",ID: "202160735",Class: "161",Password: "123456",Term: "2016"},
		Student{Name: "朱清益",ID: "202160737",Class: "161",Password: "123456",Term: "2016"},
		Student{Name: "朱光辉",ID: "202170737",Class: "171",Password: "123456",Term: "2017"},

	}

	for i, student := range students {
		studentBytes, _ := json.Marshal(student)
		err := ctx.GetStub().PutState(students[i].ID, studentBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}

// 创建新学生
func (s *SmartContract) CreateStudent(ctx contractapi.TransactionContextInterface,studentnum string, name string, id string, class string, password string,term string) error {
	student := Student{
	Name: name,
	ID: id,
	Class: class,
	Password: password,
	Term: term,
	}

	studentByte, _ := json.Marshal(student)

	return ctx.GetStub().PutState(studentnum, studentByte)
}

//登录
func (s *SmartContract) Login(ctx contractapi.TransactionContextInterface,id string,password string)( isLogin bool,err error){
	studentBytes, err := ctx.GetStub().GetState(id)
	isLogin=false;
	if err != nil {
		return 
	}
	if studentBytes == nil {
		return 
	}
	student := new(Student)
	_ = json.Unmarshal(studentBytes, student)
	if(student.Password==password){
		isLogin=true;
		return 
	}
	return 
	}
	
//查询学生信息
func (s *SmartContract) QueryStudent(ctx contractapi.TransactionContextInterface, studentNumber string) (*Student, error) {
	studentAsBytes, err := ctx.GetStub().GetState(studentNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if studentAsBytes == nil {
		return nil, fmt.Errorf("%s does not exist", studentNumber)
	}

	student := new(Student)
	_ = json.Unmarshal(studentAsBytes, student)

	return student, nil
}

//查询全部学生信息
func (s *SmartContract) QueryAllStudents(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	startKey :="202160701"
	endKey := "202180740"

	resultsIterator, err := ctx.GetStub().GetStateByRange(startKey, endKey)

	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()

	results := []QueryResult{}

	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()

		if err != nil {
			return nil, err
		}

		student := new(Student)
		_ = json.Unmarshal(queryResponse.Value, student)

		queryResult := QueryResult{Key: queryResponse.Key, Record: student}
		results = append(results, queryResult)
	}

	return results, nil
}

// 修改密码
func (s *SmartContract) ChangePassword(ctx contractapi.TransactionContextInterface, studentnum string, newpassword string) error {
	student, err := s.QueryStudent(ctx, studentnum)

	if err != nil {
		return err
	}

	student.Password = newpassword

	studentAsBytes, _ := json.Marshal(student)

	return ctx.GetStub().PutState(studentnum, studentAsBytes)
}
func (s *SmartContract) ChangePassword1(ctx contractapi.TransactionContextInterface, studentnum string, newpassword string) error {
	student, err := s.QueryStudent(ctx, studentnum)

	if err != nil {
		return err
	}

	student.Password = newpassword

	studentAsBytes, _ := json.Marshal(student)

	return ctx.GetStub().PutState(studentnum, studentAsBytes)
}

func main() {

	chaincode, err := contractapi.NewChaincode(new(SmartContract))

	if err != nil {
		fmt.Printf("Error create fabcar chaincode: %s", err.Error())
		return
	}

	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting fabcar chaincode: %s", err.Error())
	}
}
