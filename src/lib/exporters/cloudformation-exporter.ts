/**
 * CloudFormation Export Format
 * Exports architecture as AWS CloudFormation YAML template for AWS deployment
 */

import { escapeYaml, generateResourceName, createCommentHeader } from './export-utils';

export interface CloudFormationExportOptions {
  format: 'yaml' | 'json';
  includeParameters: boolean;
  includeOutputs: boolean;
}

export interface CloudFormationExportResult {
  content: string;
  filename: string;
  mimeType: string;
  description: string;
}

/**
 * Export architecture to CloudFormation format
 */
export function exportCloudFormation(
  nodes: any[],
  edges: any[],
  projectName: string = 'architecture',
  options: Partial<CloudFormationExportOptions> = {}
): CloudFormationExportResult {
  const opts: CloudFormationExportOptions = {
    format: 'yaml',
    includeParameters: true,
    includeOutputs: true,
    ...options,
  };

  if (opts.format === 'json') {
    return generateCloudFormationJSON(nodes, edges, projectName, opts);
  }

  const cfLines: string[] = [];

  // Header
  cfLines.push(createCommentHeader('cloudformation', projectName));
  cfLines.push('AWSTemplateFormatVersion: "2010-09-09"');
  cfLines.push(`Description: "Architecture template for ${escapeYaml(projectName)}"`);
  cfLines.push('');

  // Parameters section
  if (opts.includeParameters) {
    cfLines.push('Parameters:');
    cfLines.push('  Environment:');
    cfLines.push('    Type: String');
    cfLines.push('    Default: development');
    cfLines.push('    AllowedValues:');
    cfLines.push('      - development');
    cfLines.push('      - staging');
    cfLines.push('      - production');
    cfLines.push('  ');
    cfLines.push('');
  }

  // Resources section
  cfLines.push('Resources:');

  nodes.forEach((node, idx) => {
    const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx)
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    const resourceType = getCloudFormationResourceType(node.type);
    const description = node.metadata?.description || `${node.type} component`;
    const technology = node.metadata?.technology || '';

    cfLines.push('');
    cfLines.push(`  ${resourceName}:`);
    cfLines.push(`    Type: ${resourceType}`);
    cfLines.push('    Properties:');

    if (node.metadata?.name) {
      cfLines.push(`      DisplayName: "${escapeYaml(node.metadata.name)}"`);
    }

    cfLines.push(`      Description: "${escapeYaml(description)}"`);

    if (technology) {
      cfLines.push('      Tags:');
      cfLines.push(`        - Key: Technology`);
      cfLines.push(`          Value: ${escapYaml(technology)}`);
      cfLines.push('        - Key: Environment');
      cfLines.push('          Value: !Ref Environment');
    }
  });

  cfLines.push('');

  // Outputs section
  if (opts.includeOutputs) {
    cfLines.push('Outputs:');
    nodes.slice(0, 3).forEach((node, idx) => {
      const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx)
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

      cfLines.push(`  ${resourceName}Id:`);
      cfLines.push(`    Description: ID of ${escapeYaml(node.metadata?.name || 'component')}`);
      cfLines.push(`    Value: !Ref ${resourceName}`);
      cfLines.push('');
    });
  }

  const content = cfLines.join('\n');

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.yaml`,
    mimeType: 'application/yaml',
    description: 'AWS CloudFormation template - deploy architecture on AWS',
  };
}

/**
 * Generate CloudFormation JSON format
 */
function generateCloudFormationJSON(
  nodes: any[],
  edges: any[],
  projectName: string,
  options: CloudFormationExportOptions
): CloudFormationExportResult {
  const template: any = {
    AWSTemplateFormatVersion: '2010-09-09',
    Description: `Architecture template for ${projectName}`,
    Resources: {},
  };

  if (options.includeParameters) {
    template.Parameters = {
      Environment: {
        Type: 'String',
        Default: 'development',
        AllowedValues: ['development', 'staging', 'production'],
      },
    };
  }

  // Build node resource map
  const nodeIndexMap: Record<string, number> = {};
  nodes.forEach((node, idx) => {
    nodeIndexMap[node.id] = idx;
  });

  nodes.forEach((node, idx) => {
    const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx)
      .split('_')
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join('');

    const resourceType = getCloudFormationResourceType(node.type);

    const resource: any = {
      Type: resourceType,
      Properties: {
        DisplayName: node.metadata?.name || node.name || 'Component',
        Description: node.metadata?.description || `${node.type} component`,
        Tags: [
          {
            Key: 'Technology',
            Value: node.metadata?.technology || 'Unknown',
          },
          {
            Key: 'Environment',
            Value: { Ref: 'Environment' },
          },
        ],
      },
    };

    // Add dependencies based on edges
    const dependsOn = edges
      .filter((edge) => edge.target === node.id)
      .map((edge) => {
        const sourceIdx = nodeIndexMap[edge.source];
        const sourceNode = nodes[sourceIdx];
        return generateResourceName(sourceNode.metadata?.name || sourceNode.name || sourceNode.type, sourceIdx)
          .split('_')
          .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
          .join('');
      });

    if (dependsOn.length > 0) {
      resource.DependsOn = dependsOn;
    }

    template.Resources[resourceName] = resource;
  });

  if (options.includeOutputs) {
    template.Outputs = {};
    nodes.slice(0, 3).forEach((node, idx) => {
      const resourceName = generateResourceName(node.metadata?.name || node.name || node.type, idx)
        .split('_')
        .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
        .join('');

      template.Outputs[`${resourceName}Id`] = {
        Description: `ID of ${node.metadata?.name || 'component'}`,
        Value: { Ref: resourceName },
      };
    });
  }

  const content = JSON.stringify(template, null, 2);

  return {
    content,
    filename: `${projectName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-architecture.json`,
    mimeType: 'application/json',
    description: 'AWS CloudFormation template (JSON format) - deploy architecture on AWS',
  };
}

/**
 * Map node types to CloudFormation resource types
 */
function getCloudFormationResourceType(nodeType: string): string {
  const typeMap: Record<string, string> = {
    'web-frontend': 'AWS::S3::Bucket',
    'api-gateway': 'AWS::ApiGatewayV2::Api',
    'rest-api': 'AWS::ApiGateway::RestApi',
    'lambda': 'AWS::Lambda::Function',
    'container': 'AWS::ECS::Service',
    'vm': 'AWS::EC2::Instance',
    'sql-database': 'AWS::RDS::DBCluster',
    'nosql-database': 'AWS::DynamoDB::Table',
    'cache': 'AWS::ElastiCache::CacheCluster',
    'message-queue': 'AWS::SQS::Queue',
    'pub-sub': 'AWS::SNS::Topic',
    'event-bus': 'AWS::Events::EventBus',
    'load-balancer': 'AWS::ElasticLoadBalancingV2::LoadBalancer',
    'storage': 'AWS::S3::Bucket',
    'monitoring': 'AWS::CloudWatch::Alarm',
    'logging': 'AWS::Logs::LogGroup',
  };

  return typeMap[nodeType] || 'AWS::CloudFormation::WaitConditionHandle';
}

// Fix typo in function call
function escapYaml(text: string): string {
  return escapeYaml(text);
}
