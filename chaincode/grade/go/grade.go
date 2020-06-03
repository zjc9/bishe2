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

// 成绩信息结构体
type Grade struct {
	Name   string `json:"stu_name"`
	ID  string `json:"num"`
	Class string `json:"bj"`
	Teacher  string `json:"teacher"`
	 Course  string `json:"course"`
	Term string `json:"term"`
	DM1  string `json:"dm1"`
	DM2  string `json:"dm2"`
	DM3  string `json:"dm3"`
	KT1  string `json:"kt1"`
	KT2  string `json:"kt2"`
	KT3  string `json:"kt3"`
	SY1  string `json:"sy1"`
	SY2  string `json:"sy2"`
	SY3  string `json:"sy3"`
	Ps_grade string `json:"ps_grade"`
	QM  string `json:"qm_grade"`
	TotalGrade  string `json:"totalgrade"`
	Status string `json:"sta"`
	HomeWork string `json:"homework"`
	Commit string `json:"commits"`

}

//返回的结果
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Grade
}

// 初始化
func (s *SmartContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	grades := []Grade{
		Grade{Name: "张久成",ID: "202160735",Class: "网络161",Teacher: "0101",Course : "TCP/IP",Term : "2019", DM1: "80",DM2: "80",DM3: "80",KT1: "80",KT2: "80",KT3: "80",SY1: "80",SY2: "80",SY3: "80",Ps_grade: "80",QM: "90",TotalGrade: "75",Status: "待审核",HomeWork: "20216073501012019.doc",Commit: "1"},
		Grade{Name: "朱广辉",ID: "202160736",Class: "网络161",Teacher: "0101",Course : "TCP/IP",Term : "2019", DM1: "80",DM2: "80",DM3: "80",KT1: "80",KT2: "80",KT3: "80",SY1: "80",SY2: "80",SY3: "80",Ps_grade: "80",QM: "90",TotalGrade: "75",Status: "待审核",HomeWork: "20216073601012019.doc",Commit: "1"},
		Grade{Name: "朱清益",ID: "202160737",Class: "网络161",Teacher: "0101",Course : "TCP/IP",Term : "2019", DM1: "80",DM2: "80",DM3: "80",KT1: "80",KT2: "80",KT3: "80",SY1: "80",SY2: "80",SY3: "80",Ps_grade: "80",QM: "90",TotalGrade: "75",Status: "待审核",HomeWork: "20216073701012019.doc",Commit: "1"},
		Grade{Name: "朱晓峰",ID: "202160738",Class: "网络161",Teacher: "0101",Course : "TCP/IP",Term : "2019", DM1: "80",DM2: "80",DM3: "80",KT1: "80",KT2: "80",KT3: "80",SY1: "80",SY2: "80",SY3: "80",Ps_grade: "80",QM: "90",TotalGrade: "75",Status: "待审核",HomeWork: "20216073801012019.doc",Commit: "1"},

	}

	for i, grade := range grades {
		gradeBytes, _ := json.Marshal(grade)
		err := ctx.GetStub().PutState(grades[i].ID+grades[i].Teacher+grades[i].Term, gradeBytes)

		if err != nil {
			return fmt.Errorf("Failed to put to world state. %s", err.Error())
		}
	}

	return nil
}
//查询单个成绩
func (s *SmartContract) QueryGrade(ctx contractapi.TransactionContextInterface, gradeID string) (*Grade, error) {
	Bytes, err := ctx.GetStub().GetState(gradeID)

	if err != nil {
		return nil, fmt.Errorf("Failed to read from world state. %s", err.Error())
	}

	if Bytes == nil {
		return nil, fmt.Errorf("%s does not exist", gradeID)
	}

	grade := new(Grade)
	_ = json.Unmarshal(Bytes, grade)

	return grade, nil
}

//查询全部成绩
func (s *SmartContract) QueryAllGrades(ctx contractapi.TransactionContextInterface) ([]QueryResult, error) {
	startKey :="20216070101012019"
	endKey :=  "20216074001012019"

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

		grade := new(Grade)
		_ = json.Unmarshal(queryResponse.Value, grade)

		queryResult := QueryResult{Key: queryResponse.Key, Record: grade}
		results = append(results, queryResult)
	}

	return results, nil
}
func (s *SmartContract) GetGrade(ctx contractapi.TransactionContextInterface,studentnum string) ([]QueryResult, error) {
	startKey :="20216070101012019"
	endKey :=  "20216074001012019"

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

		grade := new(Grade)
		_ = json.Unmarshal(queryResponse.Value, grade)
		if(grade.ID!=studentnum){
		continue
		}
		queryResult := QueryResult{Key: queryResponse.Key, Record: grade}
		results = append(results, queryResult)
	}

	return results, nil
}
func (s *SmartContract) PostGrade(ctx contractapi.TransactionContextInterface,gradeID string, name string, id string, class string, term string,teacher string,course string,kt1 string,kt2 string, kt3 string,dm1 string,dm2 string,dm3 string,sy1 string,sy2 string,sy3 string,ps_grade string,qm_grade string,totalgrade string,sta string) error {
	grade := Grade{
		Name :name,
		ID  : id,
		Class : class,
		Teacher:teacher,
		 Course:course,
		Term :term,
		DM1 : dm1,
		DM2: dm2,
		DM3 :dm3,
		KT1 : kt1,
		KT2 : kt2,
		KT3 :kt3,
		SY1  :sy1,
		SY2 :sy2,
		SY3 : sy3,
		Ps_grade :ps_grade,
		QM  :qm_grade,
		TotalGrade :totalgrade,
		Status :sta,
		HomeWork: "空",
		Commit: "1",
	}

	GradeByte, _ := json.Marshal(grade)

	return ctx.GetStub().PutState(gradeID, GradeByte)
}
// func (s *SmartContract) PostGrade1(ctx contractapi.TransactionContextInterface,arrs []string) error {
// 	for i,v:=range arrs{
// 		gradeBytes, _ := json.Marshal(v)
// 	}
// 	grade := Grade{
// 		Name :name,
// 		ID  : id,
// 		Class : class,
// 		Teacher:teacher,
// 		 Course:course,
// 		Term :term,
// 		DM1 : dm1,
// 		DM2: dm2,
// 		DM3 :dm3,
// 		KT1 : kt1,
// 		KT2 : kt2,
// 		KT3 :kt3,
// 		SY1  :sy1,
// 		SY2 :sy2,
// 		SY3 : sy3,
// 		Ps_grade :ps_grade,
// 		QM  :qm_grade,
// 		TotalGrade :totalgrade,
// 		Status :sta,
// 	}

// 	GradeByte, _ := json.Marshal(grade)

// 	return ctx.GetStub().PutState(gradeID, GradeByte)
// }
// 修改状态
func (s *SmartContract) PostStatus(ctx contractapi.TransactionContextInterface, gradeID string, newsta string) error {
	Byte, err := s.QueryGrade(ctx,gradeID)

	if err != nil {
		return err
	}
	Byte.Status = newsta
	Bytes, _ := json.Marshal(Byte)

	return ctx.GetStub().PutState(gradeID, Bytes)
}
func (s *SmartContract) PostHomework(ctx contractapi.TransactionContextInterface, gradeID string, address string) error {
	Byte, err := s.QueryGrade(ctx,gradeID)

	if err != nil {
		return err
	}

	Byte.HomeWork = address

	Bytes, _ := json.Marshal(Byte)

	return ctx.GetStub().PutState(gradeID, Bytes)
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
