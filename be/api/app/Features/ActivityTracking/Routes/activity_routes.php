<?php

use App\Core\Router;
use App\Features\ActivityTracking\Actions\ViewAllActivities;
use App\Features\ActivityTracking\Actions\GetActivityFilters;
use App\Features\ActivityTracking\Actions\DeleteActivityLog;
use App\Features\ActivityTracking\Actions\DeleteAllActivityLogs;
use App\Features\ActivityTracking\Actions\GetFilteredActivities;
use App\Shared\Middleware\AuthenticationCheck;
use App\Shared\Middleware\ActivityLogger;
use App\Shared\Middleware\RoleVerification;

$router = Router::getInstance();

// Get activity filters (modules, roles, users for dropdowns)
$router->get('/api/activities/filters', function ($request, $response) {
    $controller = new GetActivityFilters();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ActivityTracking', 'GetFilters')
]);

// View all activities
$router->get('/api/activities', function ($request, $response) {
    $controller = new ViewAllActivities();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new ActivityLogger('ActivityTracking', 'ViewAll')
]);

// Get filtered activities (no pagination)
$router->get('/api/activities/filtered', function ($request, $response) {
   $controller = new GetFilteredActivities();
   return $controller->execute($request, $response);
}, [
   new AuthenticationCheck(),
   new ActivityLogger('ActivityTracking', 'GetFilteredActivities')
]);

// Delete activity log
$router->delete('/api/activities/:id', function ($request, $response) {
    $controller = new DeleteActivityLog();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Only admins can delete logs
    new ActivityLogger('ActivityTracking', 'DeleteLog')
]);

// Delete all activity logs
$router->delete('/api/activities', function ($request, $response) {
    $controller = new DeleteAllActivityLogs();
    return $controller->execute($request, $response);
}, [
    new AuthenticationCheck(),
    new RoleVerification('admin'), // Only admins can delete all logs
    new ActivityLogger('ActivityTracking', 'DeleteAllLogs')
]);
