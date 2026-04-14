/**
 * Terraform Export Format
 * Exports architecture as Terraform HCL code for AWS/GCP/Azure deployment
 */

import { escapeTerraform, generateResourceName, createCommentHeader } from './export-utils';

export interface TerraformExportOptions {
  provider: 'aws' | 'gcp' | 'azure';
  includeVariables: boolean;
  includeOutputs: boolean;
}

export interface TerraformExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to Terraform HCL format
 */
export function exportTerraform(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<TerraformExportOptions> = {}
): TerraformExportResult {
  const opts: TerraformExportOptions = {
    provider: 'aws',
    includeVariables: true,
    includeOutputs: true,
    ...options,
  };

  const tfLines: string[] = [];

  // Header
  tfLines.push(createCommentHeader('terraform', projectName));
  tfLines.push('');

  // Terraform version and provider config
  tfLines.push('terraform {');
  tfLines.push('  required_version = ">= 1.0"');
  tfLines.push('  required_providers {');

  if (opts.provider === 'aws') {
    tfLines.push('    aws = {');
    tfLines.push('      source  = "hashicorp/aws"');
    tfLines.push('      version = "~> 5.0"');
    tfLines.push('    }');
  } else if (opts.provider === 'gcp') {
    tfLines.push('    google = {');
    tfLines.push('      source  = "hashicorp/google"');
    tfLines.push('      version = "~> 5.0"');
    tfLines.push('    }');
  } else if (opts.provider === 'azure') {
    tfLines.push('    azurerm = {');
    tfLines.push('      source  = "hashicorp/azurerm"');
    tfLines.push('      version = "~> 3.0"');
    tfLines.push('    }');
  }

  tfLines.push('  }');
  tfLines.push('}');
  tfLines.push('');

  // Provider configuration
  if (opts.provider === 'aws') {
    tfLines.push('provider "aws" {');
    tfLines.push('  region = var.aws_region');
    tfLines.push('}');
  } else if (opts.provider === 'gcp') {
    tfLines.push('provider "google" {');
    tfLines.push('  project = var.gcp_project');
    tfLines.push('  region  = var.gcp_region');
    tfLines.push('}');
  } else if (opts.provider === 'azure') {
    tfLines.push('provider "azurerm" {');
    tfLines.push('  features {}');
    tfLines.push('  subscription_id = var.azure_subscription_id');
    tfLines.push('}');
  }

  tfLines.push('');

  // Variables section
  if (opts.includeVariables) {
    tfLines.push('# Variables');
    if (opts.provider === 'aws') {
      tfLines.push('variable "aws_region" {');
      tfLines.push('  type    = string');
      tfLines.push('  default = "us-east-1"');
      tfLines.push('}');
    } else if (opts.provider === 'gcp') {
      tfLines.push('variable "gcp_project" {');
      tfLines.push('  type = string');
      tfLines.push('}');
      tfLines.push('variable "gcp_region" {');
      tfLines.push('  type    = string');
      tfLines.push('  default = "us-central1"');
      tfLines.push('}');
    } else if (opts.provider === 'azure') {
      tfLines.push('variable "azure_subscription_id" {');
      tfLines.push('  type = string');
      tfLines.push('}');
    }

    tfLines.push('variable "environment" {');
    tfLines.push('  type    = string');
    tfLines.push('  default = "development"');
    tfLines.push('}');
    tfLines.push('');
  }

  // Resources section
  tfLines.push('# Resources');
  const nodeTypeMap: Record<string, string> = generateNodeTypeMap(opts.provider);

  // Build node ID to resource name map
  const nodeIndexMap: Record<string, number> = {};
  nodes.forEach((node, idx) => {
    nodeIndexMap[node.id] = idx;
  });

  nodes.forEach((node, idx) => {
    const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx);
    const resourceType = nodeTypeMap[node.type] || 'null_resource';
    const description = node.metadata?.description || `${node.type} component`;
    const technology = node.metadata?.technology || '';

    tfLines.push('');
    tfLines.push(`# ${escapeTerraform(node.metadata?.name || node.name || 'Component')}`);
    if (description) {
      tfLines.push(`# Description: ${escapeTerraform(description)}`);
    }

    tfLines.push(`resource "${resourceType}" "${resourceName}" {`);

    if (node.metadata?.name) {
      tfLines.push(`  name = "${escapeTerraform(node.metadata.name)}"`);
    }

    if (description) {
      tfLines.push(`  description = "${escapeTerraform(description)}"`);
    }

    if (technology) {
      tfLines.push(`  tags = {`);
      tfLines.push(`    Technology = "${escapeTerraform(technology)}"`);
      tfLines.push(`    Environment = var.environment`);
      tfLines.push(`  }`);
    }

    // Add depends_on based on incoming edges
    const dependsOn = edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => {
        const sourceIdx = nodeIndexMap[edge.source];
        const sourceNode = nodes[sourceIdx];
        return generateResourceName(sourceNode.metadata?.name || sourceNode.name || sourceNode.type, sourceIdx);
      });

    if (dependsOn.length > 0) {
      tfLines.push(`  depends_on = [`);
      dependsOn.forEach((dep) => {
        const depType = nodeTypeMap[nodes[nodeIndexMap[dep]]?.type] || 'null_resource';
        tfLines.push(`    ${depType}.${dep},`);
      });
      tfLines.push(`  ]`);
    }

    tfLines.push(`}`);
  });

  tfLines.push('');

  // Outputs section
  if (opts.includeOutputs) {
    tfLines.push('# Outputs');
    nodes.slice(0, 3).forEach((node, idx) => {
      const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx);
      const resourceType = nodeTypeMap[node.type] || 'null_resource';

      tfLines.push(`output "${resourceName}_id" {`);
      tfLines.push(`  value = ${resourceType}.${resourceName}.id`);
      tfLines.push(`}`);
      tfLines.push('');
    });
  }

  const content = tfLines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.tf`,
    mimeType: 'application/x-terraform',
    description: `Terraform HCL code for ${opts.provider.toUpperCase()} infrastructure deployment`,
  };
}

/**
 * Generate resource type mapping based on cloud provider
 */
function generateNodeTypeMap(provider: string): Record<string, string> {
  const baseMap: Record<string, Record<string, string>> = {
    aws: {
      'web-frontend': 'aws_s3_bucket',
      'api-gateway': 'aws_apigatewayv2_api',
      'rest-api': 'aws_api_gateway_rest_api',
      'lambda': 'aws_lambda_function',
      'container': 'aws_ecs_service',
      'sql-database': 'aws_rds_cluster_instance',
      'nosql-database': 'aws_dynamodb_table',
      'cache': 'aws_elasticache_cluster',
      'message-queue': 'aws_sqs_queue',
      'load-balancer': 'aws_lb',
      'storage': 'aws_s3_bucket',
      'monitoring': 'aws_cloudwatch_metric_alarm',
      'logging': 'aws_cloudwatch_log_group',
    },
    gcp: {
      'web-frontend': 'google_storage_bucket',
      'api-gateway': 'google_api_gateway_api',
      'rest-api': 'google_compute_network',
      'lambda': 'google_cloudfunctions_function',
      'container': 'google_container_cluster',
      'sql-database': 'google_sql_database_instance',
      'nosql-database': 'google_firestore_database',
      'cache': 'google_redis_instance',
      'message-queue': 'google_pubsub_topic',
      'load-balancer': 'google_compute_backend_service',
      'storage': 'google_storage_bucket',
      'monitoring': 'google_monitoring_alert_policy',
      'logging': 'google_logging_metric_sink',
    },
    azure: {
      'web-frontend': 'azurerm_storage_account',
      'api-gateway': 'azurerm_api_management',
      'rest-api': 'azurerm_app_service',
      'lambda': 'azurerm_function_app',
      'container': 'azurerm_container_group',
      'sql-database': 'azurerm_mssql_database',
      'nosql-database': 'azurerm_cosmosdb_account',
      'cache': 'azurerm_redis_cache',
      'message-queue': 'azurerm_servicebus_queue',
      'load-balancer': 'azurerm_lb',
      'storage': 'azurerm_storage_account',
      'monitoring': 'azurerm_monitor_action_group',
      'logging': 'azurerm_log_analytics_workspace',
    },
  };

  return baseMap[provider] || baseMap.aws;
}
