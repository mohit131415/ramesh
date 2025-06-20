<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\AuthorizationException;

class DeleteFeaturedItem
{
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
        
            // Get parameters from the request body
            $body = $request->getBody();
            $entityId = $body['entity_id'] ?? null;
            $displayType = $body['display_type'] ?? null;
        
            // Validate required parameters
            if (!$entityId || !$displayType) {
                return [
                    'status' => 'error',
                    'message' => 'Both entity_id and display_type are required',
                    'data' => null
                ];
            }
        
            // Get user ID if available
            $userId = null;
            $user = $this->authentication->user();
            if ($user !== null && isset($user['id'])) {
                $userId = $user['id'];
            }
        
            // Find the item by entity_id and display_type
            $item = $this->featuredItemService->getFeaturedItemByEntityAndType($entityId, $displayType);
            if (!$item) {
                throw new NotFoundException("Featured item not found with entity_id: $entityId and display_type: $displayType");
            }
        
            $id = $item['id'];
            $displayOrder = $item['display_order'];
        
            // Delete the featured item
            $this->featuredItemService->deleteFeaturedItem($id, $userId);
        
            // Reorder remaining items to ensure no gaps in display order
            $this->featuredItemService->reorderAfterDeletion($displayType, $displayOrder);
        
            return [
                'status' => 'success',
                'message' => 'Featured item deleted successfully and remaining items reordered',
                'data' => null
            ];
        } catch (NotFoundException $e) {
            return [
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null
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
