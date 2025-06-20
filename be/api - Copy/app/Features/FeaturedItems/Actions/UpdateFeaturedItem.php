<?php

namespace App\Features\FeaturedItems\Actions;

use App\Core\Request;
use App\Core\Response;
use App\Features\FeaturedItems\Services\FeaturedItemService;
use App\Core\Security\Authentication;
use App\Shared\Exceptions\ValidationException;
use App\Shared\Exceptions\NotFoundException;
use App\Shared\Exceptions\AuthorizationException;
use App\Shared\Traits\ValidatesInput;

class UpdateFeaturedItem
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
           
           $id = (int) $request->getParam('id');
           
           // Validate input
           $rules = [
               'entity_id' => 'numeric',
               'display_type' => 'in:featured_product,featured_category,quick_pick',
               'display_order' => 'numeric'
           ];
           
           $data = $this->validate($request->getBody(), $rules);
           
           // Log the request data for debugging
           error_log("UpdateFeaturedItem request data: ID={$id}, Data=" . json_encode($data));
           
           // Get user ID if available
           $userId = null;
           try {
               $user = $this->authentication->user();
               if ($user && isset($user['id'])) {
                   $userId = $user['id'];
               }
           } catch (\Exception $e) {
               error_log("Error getting user: " . $e->getMessage());
           }
           
           // Update featured item
           $featuredItem = $this->featuredItemService->updateFeaturedItem($id, $data, $userId);
           
           return [
               'status' => 'success',
               'message' => 'Featured item updated successfully',
               'data' => $featuredItem
           ];
       } catch (ValidationException $e) {
           error_log("Validation error in UpdateFeaturedItem: " . $e->getMessage());
           return [
               'status' => 'error',
               'message' => $e->getMessage(),
               'data' => null,
               'errors' => $e->getErrors()
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
           error_log("Error in UpdateFeaturedItem: " . $e->getMessage());
           return [
               'status' => 'error',
               'message' => $e->getMessage(),
               'data' => null
           ];
       }
   }
}
