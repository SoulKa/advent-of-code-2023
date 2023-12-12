package shared

import (
	"os"
	"strings"
)

type Result struct {
	Part1 int
	Part2 int
	Day   int
}

func GetLines() []string {
	if file, err := os.ReadFile("input.txt"); err != nil {
		panic(err)
	} else {
		return strings.Split(string(file), "\n")
	}
}

func (*Result) Log() {
	
}
