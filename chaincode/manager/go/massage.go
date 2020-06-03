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
type Manager struct {
	Name   string `json:"name"`
	ID  string `json:"id"`
	Partment string `json:"partment"`
	Password  string `json:"password"`
}

//返回的结果
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Manager
}

// 初始化
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	managers := []Manager{
		Manager{Name: "田家培",ID: "1306",Partment: "计算机学院",Password: "123456"},
		Manager{Name: "汤唯男",ID: "1203",Partment: "数理部",Password: "123456"},
		Manager{Name: "章成",ID: "203",Partment: "教务处",Password: "123456"},

	}

	for i, manager := range managers {
		managerBytes, _ := json.Marshal(manager)
		err := ctx.GetStub().PutState(managers[i].ID, managerBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}

// 创建管理者{admin/teacher}
func (s *SmartContract) CreateStudent(ctx contractapi.TransactionContextInterface,managernum string, name string, id string, class string, password string) error {
	manager := Manager{
	Name: name,
	ID: id,
	Partment: class,
	Password: password,
	}

	managerByte, _ := json.Marshal(manager)

	return ctx.GetStub().PutState(managernum, managerByte)
}

//登录
func (s *SmartContract) Login(ctx contractapi.TransactionContextInterface,id string,password string)( isLogin bool,err error){
	Bytes, err := ctx.GetStub().GetState(id)
	isLogin=false;
	if err != nil {
		return 
	}
	if Bytes == nil {
		return 
	}
	manager := new(Manager)
	_ = json.Unmarshal(Bytes, manager)
	if(manager.Password==password){
		isLogin=true;
		return 
	}
	return 
	}
	
//查询管理者信息
func (s *SmartContract) QueryManager(ctx contractapi.TransactionContextInterface, studentNumber string) (*Manager, error) {
	Bytes, err := ctx.GetStub().GetState(studentNumber)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if Bytes == nil {
		return nil, fmt.Errorf("%s does not exist", studentNumber)
	}

	manager := new(Manager)
	_ = json.Unmarshal(Bytes, manager)

	return manager, nil
}

//查询全部学生信息
func (s *SmartContract) QueryAllMangers(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	startKey :="200"
	endKey := "4000"

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

		manager := new(Manager)
		_ = json.Unmarshal(queryResponse.Value, manager)

		queryResult := QueryResult{Key: queryResponse.Key, Record: manager}
		results = append(results, queryResult)
	}

	return results, nil
}

// 修改密码
func (s *SmartContract) ChangePassword(ctx contractapi.TransactionContextInterface, studentnum string, newpassword string) error {
	student, err := s.QueryManager(ctx, studentnum)

	if err != nil {
		return err
	}

	student.Password = newpassword

	studentAsBytes, _ := json.Marshal(student)

	return ctx.GetStub().PutState(studentnum, studentAsBytes)
}
func (s *SmartContract) ChangePassword1(ctx contractapi.TransactionContextInterface, studentnum string, newpassword string) error {
	student, err := s.QueryManager(ctx, studentnum)

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
