#!/bin/bash

# Nest Wild Shopify Theme Deployment Script
# This script helps manage deployments and rollbacks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Nest Wild Shopify Theme Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  deploy [version]    Deploy current changes to production"
    echo "  rollback [version]  Rollback to a specific version"
    echo "  tag [version]       Create a new release tag"
    echo "  status             Show current Git status"
    echo "  list-tags          List all available tags"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy v1.1.0"
    echo "  $0 rollback v1.0.0"
    echo "  $0 tag v1.2.0"
}

# Function to check if we're on main branch
check_main_branch() {
    current_branch=$(git branch --show-current)
    if [ "$current_branch" != "main" ]; then
        print_error "You must be on the main branch to deploy. Current branch: $current_branch"
        exit 1
    fi
}

# Function to check for uncommitted changes
check_clean_working_directory() {
    if ! git diff-index --quiet HEAD --; then
        print_error "You have uncommitted changes. Please commit or stash them first."
        git status --short
        exit 1
    fi
}

# Function to deploy
deploy() {
    local version=$1
    
    print_status "Starting deployment process..."
    
    check_main_branch
    check_clean_working_directory
    
    # Pull latest changes
    print_status "Pulling latest changes from remote..."
    git pull origin main
    
    # Create tag if version provided
    if [ -n "$version" ]; then
        print_status "Creating release tag: $version"
        git tag -a "$version" -m "Release $version"
        git push origin "$version"
        print_success "Created and pushed tag: $version"
    fi
    
    # Deploy to Shopify (you'll need to customize this based on your deployment method)
    print_status "Deploying to Shopify..."
    print_warning "Please run your Shopify deployment command manually:"
    echo "  shopify theme push"
    echo "  or"
    echo "  shopify theme deploy"
    
    print_success "Deployment process completed!"
}

# Function to rollback
rollback() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Please specify a version to rollback to."
        echo "Available versions:"
        git tag -l | sort -V
        exit 1
    fi
    
    print_status "Rolling back to version: $version"
    
    # Check if tag exists
    if ! git tag -l | grep -q "^$version$"; then
        print_error "Version $version not found. Available versions:"
        git tag -l | sort -V
        exit 1
    fi
    
    # Confirm rollback
    read -p "Are you sure you want to rollback to $version? This will reset your working directory. (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Rollback cancelled."
        exit 0
    fi
    
    # Reset to the specified version
    print_status "Resetting to version $version..."
    git reset --hard "$version"
    
    print_success "Successfully rolled back to $version"
    print_warning "Don't forget to deploy the rolled back version to Shopify!"
}

# Function to create tag
create_tag() {
    local version=$1
    
    if [ -z "$version" ]; then
        print_error "Please specify a version for the tag."
        exit 1
    fi
    
    check_main_branch
    check_clean_working_directory
    
    print_status "Creating release tag: $version"
    git tag -a "$version" -m "Release $version"
    git push origin "$version"
    
    print_success "Created and pushed tag: $version"
}

# Function to show status
show_status() {
    print_status "Current Git status:"
    echo ""
    echo "Current branch: $(git branch --show-current)"
    echo "Last commit: $(git log -1 --oneline)"
    echo ""
    
    if ! git diff-index --quiet HEAD --; then
        print_warning "You have uncommitted changes:"
        git status --short
    else
        print_success "Working directory is clean"
    fi
}

# Function to list tags
list_tags() {
    print_status "Available tags:"
    git tag -l | sort -V
}

# Main script logic
case "$1" in
    "deploy")
        deploy "$2"
        ;;
    "rollback")
        rollback "$2"
        ;;
    "tag")
        create_tag "$2"
        ;;
    "status")
        show_status
        ;;
    "list-tags")
        list_tags
        ;;
    "help"|"-h"|"--help")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
