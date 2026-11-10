package main

import (
	"encoding/json"
	"errors"
	"log"
	"math"
	"net/http"
	"strings"
)

type Request struct {
	A *float64 `json:"a"`
	B *float64 `json:"b,omitempty"`
}
type Response struct {
	Operation string  `json:"operation"`
	Result    float64 `json:"result"`
}
type ErrorResponse struct {
	Error string `json:"error"`
}

func calculate(op string, a, b float64) (float64, error) {
	switch op {
	case "add":
		return a + b, nil
	case "subtract":
		return a - b, nil
	case "multiply":
		return a * b, nil
	case "divide":
		if b == 0 {
			return 0, errors.New("division by zero is not allowed")
		}
		return a / b, nil
	case "power":
		return math.Pow(a, b), nil
	case "sqrt":
		if a < 0 {
			return 0, errors.New("square root of a negative number is not supported")
		}
		return math.Sqrt(a), nil
	case "percent":
		return a * b / 100, nil
	default:
		return 0, errors.New("unsupported operation")
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func calculatorHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, ErrorResponse{"use POST"})
		return
	}
	op := strings.TrimPrefix(r.URL.Path, "/api/calculate/")
	if op == "" || strings.Contains(op, "/") {
		writeJSON(w, http.StatusNotFound, ErrorResponse{"operation not found"})
		return
	}
	decoder := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20))
	decoder.DisallowUnknownFields()
	var req Request
	if err := decoder.Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"invalid JSON request: provide numeric fields a and b"})
		return
	}
	if req.A == nil || (op != "sqrt" && req.B == nil) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"missing required numeric field(s): a and b (sqrt only requires a)"})
		return
	}
	b := 0.0
	if req.B != nil {
		b = *req.B
	}
	if math.IsNaN(*req.A) || math.IsInf(*req.A, 0) || math.IsNaN(b) || math.IsInf(b, 0) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"inputs must be finite numbers"})
		return
	}
	result, err := calculate(op, *req.A, b)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{err.Error()})
		return
	}
	if math.IsNaN(result) || math.IsInf(result, 0) {
		writeJSON(w, http.StatusBadRequest, ErrorResponse{"result is outside the supported numeric range"})
		return
	}
	writeJSON(w, http.StatusOK, Response{op, result})
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/health", healthHandler)
	mux.HandleFunc("/api/calculate/", calculatorHandler)
	addr := ":8080"
	log.Printf("Calculator API listening on %s", addr)
	log.Fatal(http.ListenAndServe(addr, withCORS(mux)))
}
func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
