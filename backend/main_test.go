package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCalculate(t *testing.T) {
	cases := []struct {
		name       string
		a, b, want float64
		op         string
	}{
		{"addition", 2, 3, 5, "add"}, {"subtraction", 9, 4, 5, "subtract"},
		{"multiplication", 3, 4, 12, "multiply"}, {"division", 8, 2, 4, "divide"},
		{"power", 2, 3, 8, "power"}, {"square root", 81, 0, 9, "sqrt"}, {"percentage", 50, 10, 5, "percent"},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got, err := calculate(tc.op, tc.a, tc.b)
			if err != nil || got != tc.want {
				t.Fatalf("got %v, %v; want %v", got, err, tc.want)
			}
		})
	}
}
func TestCalculateErrors(t *testing.T) {
	for _, tc := range []struct {
		op   string
		a, b float64
	}{{"divide", 4, 0}, {"sqrt", -1, 0}, {"unknown", 1, 2}} {
		if _, err := calculate(tc.op, tc.a, tc.b); err == nil {
			t.Errorf("expected error for %s", tc.op)
		}
	}
}
func TestCalculatorHandler(t *testing.T) {
	a, b := 10.0, 5.0
	body, _ := json.Marshal(Request{A: &a, B: &b})
	r := httptest.NewRequest(http.MethodPost, "/api/calculate/add", bytes.NewReader(body))
	w := httptest.NewRecorder()
	calculatorHandler(w, r)
	if w.Code != http.StatusOK {
		t.Fatalf("status %d", w.Code)
	}
	var got Response
	if err := json.Unmarshal(w.Body.Bytes(), &got); err != nil {
		t.Fatal(err)
	}
	if got.Result != 15 {
		t.Fatalf("got %v", got.Result)
	}
}
func TestCalculatorHandlerRejectsDivisionByZero(t *testing.T) {
	body := bytes.NewBufferString(`{"a":12,"b":0}`)
	r := httptest.NewRequest(http.MethodPost, "/api/calculate/divide", body)
	w := httptest.NewRecorder()
	calculatorHandler(w, r)
	if w.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", w.Code)
	}
}
func TestCalculatorHandlerRejectsMethod(t *testing.T) {
	r := httptest.NewRequest(http.MethodGet, "/api/calculate/add", nil)
	w := httptest.NewRecorder()
	calculatorHandler(w, r)
	if w.Code != http.StatusMethodNotAllowed {
		t.Fatalf("expected 405, got %d", w.Code)
	}
}
