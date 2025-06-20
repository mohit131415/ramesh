<?php

namespace App\Core;

class Response
{
    private $statusCode = 200;
    private $headers = [];

    public function setStatusCode($code)
    {
        $this->statusCode = $code;
        return $this;
    }

    public function setHeader($name, $value)
    {
        $this->headers[$name] = $value;
        return $this;
    }

    public function removeHeader($name)
    {
        unset($this->headers[$name]);
        return $this;
    }

    public function json($data, $code = null)
    {
        if ($code !== null) {
            $this->statusCode = $code;
        }
        
        // Ensure we're sending JSON
        http_response_code($this->statusCode);
        
        // Set content type header
        $this->setHeader('Content-Type', 'application/json');
        
        // Set all headers
        foreach ($this->headers as $name => $value) {
            header("$name: $value");
        }
        
        // Format the response consistently
        $response = [];
        
        if (is_array($data) && isset($data['status'])) {
            // Data already has status field, use it as is
            $response = $data;
        } else {
            // Format the response with standard fields
            $response = [
                'status' => $this->statusCode >= 200 && $this->statusCode < 300 ? 'success' : 'error',
                'message' => $this->getDefaultMessage($this->statusCode),
                'data' => $data
            ];
        }
        
        // Ensure we have all required fields
        if (!isset($response['status'])) {
            $response['status'] = $this->statusCode >= 200 && $this->statusCode < 300 ? 'success' : 'error';
        }
        
        if (!isset($response['message'])) {
            $response['message'] = $this->getDefaultMessage($this->statusCode);
        }
        
        if (!isset($response['data']) && !in_array($this->statusCode, [204])) {
            $response['data'] = null;
        }
        
        echo json_encode($response);
        exit;
    }

    private function getDefaultMessage($code)
    {
        $messages = [
            200 => 'OK',
            201 => 'Created',
            204 => 'No Content',
            400 => 'Bad Request',
            401 => 'Unauthorized',
            403 => 'Forbidden',
            404 => 'Not Found',
            422 => 'Validation Failed',
            500 => 'Internal Server Error'
        ];
        
        return $messages[$code] ?? 'Unknown Status';
    }

    public function text($text, $code = null)
    {
        if ($code !== null) {
            $this->statusCode = $code;
        }
        
        http_response_code($this->statusCode);
        
        // Set content type header
        $this->setHeader('Content-Type', 'text/plain');
        
        // Set all headers
        foreach ($this->headers as $name => $value) {
            header("$name: $value");
        }
        
        echo $text;
        exit;
    }

    public function redirect($url, $code = 302)
    {
        http_response_code($code);
        header("Location: $url");
        exit;
    }

    public function noContent()
    {
        http_response_code(204);
        exit;
    }

    public function notFound($message = 'Not Found')
    {
        return $this->json([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ], 404);
    }

    public function badRequest($message = 'Bad Request')
    {
        return $this->json([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ], 400);
    }

    public function unauthorized($message = 'Unauthorized')
    {
        return $this->json([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ], 401);
    }

    public function forbidden($message = 'Forbidden')
    {
        return $this->json([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ], 403);
    }

    public function serverError($message = 'Internal Server Error')
    {
        return $this->json([
            'status' => 'error',
            'message' => $message,
            'data' => null
        ], 500);
    }

    public function created($data, $message = 'Resource Created')
    {
        return $this->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], 201);
    }

    public function ok($data, $message = 'Success')
    {
        return $this->json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], 200);
    }
}
