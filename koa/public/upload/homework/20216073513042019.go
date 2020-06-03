package main

import (
	"fmt"
	"encoding/json"
)

// 成绩信息结构体
type Grade struct {
	Stu_name   string `json:"stu_name"`
	Num  string `json:"num"`
	Bj string `json:"bj"`
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

}

//返回的结果
type QueryResult struct {
	Key    string `json:"Key"`
	Record *Grade
}

func main(){
 s1 :=[...]Grade[{"num":202160716,"bj":"网络161","stu_name":"黄承轩","teacher":"李大伟","course":"tcp/ip","dm1":56,"dm2":33,"dm3":75,"kt1":85,"kt2":74,"kt3":51,"sy1":59,"sy2":69,"sy3":88,"term":2019,"ps_grade":"67.9","qm_grade":80,"totalgrade":"76.1","sta":"待审核"}]
s :=`{"num":202160716,"bj":"网络161","stu_name":"黄承轩","teacher":"李大伟","course":"tcp/ip","dm1":56,"dm2":33,"dm3":75,"kt1":85,"kt2":74,"kt3":51,"sy1":59,"sy2":69,"sy3":88,"term":2019,"ps_grade":"67.9","qm_grade":80,"totalgrade":"76.1","sta":"待审核"}`
 grade :=new(Grade) 
_ = json.Unmarshal([]byte(s), grade)

	fmt.Println(s1[0])
}
