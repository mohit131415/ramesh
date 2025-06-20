<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Traits\ValidatesInput;

class UpdateFeaturedItemLimits
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
            
            $userId = null;
            try {
                $user = $this->authentication->user();
                if ($user && isset($user['id'])) {
                    $userId = $user['id'];
                }
            } catch (\Exception $e) {
                error_log("Error getting user: " . $e->getMessage());
            }
            
            // Validate input
            $rules = [
                'featured_product' => 'required|numeric|min:1',
                'featured_category' => 'required|numeric|min:1',
                'quick_pick' => 'required|numeric|min:1'
            ];
            
            $data = $this->validate($request->getBody(), $rules);
            
            // Update featured item limits
            $result = $this->featuredItemService->updateFeaturedItemLimits($data, $user ? $user['id'] : null);
            
            return [
                'status' => 'success',
                'message' => 'Featured item limits updated successfully',
                'data' => $result
            ];
        } catch (ValidationException $e) {
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
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
            ];
        }
    }
}
