<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Traits\ValidatesInput;

class CreateFeaturedItem
{
    use ValidatesInput;

    private $featuredItemService;
    private $authentication;

    public function __construct()
    {
        $this->featuredItemService = new FeaturedItemService();
        $this->authentication = Authentication::getInstance();
    }

    public function execute(Request $request, Response $response)
    {
        try {
            // Check if user is authenticated
            if (!$this->authentication->check()) {
                return [
                    'status' => 'error',
                    'message' => 'Unauthorized access',
                    'data' => null
                ];
            }
            
            // Validate input
            $rules = [
                'entity_id' => 'required|numeric',
                'display_type' => 'required|in:featured_product,featured_category,quick_pick'
            ];
            
            $data = $this->validate($request->getBody(), $rules);
            
            // Log the request data for debugging
            error_log("CreateFeaturedItem request data: " . json_encode($data));
            
            // Get user ID if available
            $userId = null;
            $user = $this->authentication->user();
            if ($user !== null && isset($user['id'])) {
                $userId = $user['id'];
            }
            
            // Create featured item
            $featuredItem = $this->featuredItemService->createFeaturedItem($data, $userId);
            
            return [
                'status' => 'success',
                'message' => 'Featured item created successfully',
                'data' => $featuredItem
            ];
        } catch (ValidationException $e) {
            error_log("Validation error in CreateFeaturedItem: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null,
                'errors' => $e->getErrors()
            ];
        } catch (AuthorizationException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        } catch (\Exception $e) {
            error_log("Error in CreateFeaturedItem: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }
}
