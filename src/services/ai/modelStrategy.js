// Optimal Claude model strategy for email generation
// src/services/ai/modelStrategy.js

export const modelStrategy = {
  // Model selection based on user tier and task complexity
  getOptimalModel: (userTier, taskType = 'standard') => {
    const baseConfig = {
      // Free users - use cheapest model
      free: {
        model: 'claude-3-haiku-20240307',
        maxTokens: 1000,
        costPer1KTokens: 0.00025, // $0.25 per 1M tokens
        description: 'Fast, cost-effective for basic emails'
      },
      
      // Pro users - balanced performance/cost
      pro: {
        model: 'claude-3-5-sonnet-20241022',
        maxTokens: 4000,
        costPer1KTokens: 0.003, // $3 per 1M tokens
        description: 'Best balance for quality emails'
      },
      
      // Gold users - premium model
      gold: {
        model: 'claude-3-5-sonnet-20241022', // or Claude-4 when available
        maxTokens: 8000,
        costPer1KTokens: 0.003,
        description: 'Highest quality, complex email series'
      }
    };

    const config = baseConfig[userTier] || baseConfig.free;

    // Adjust based on task complexity
    if (taskType === 'complex') {
      config.maxTokens = Math.min(config.maxTokens * 1.5, 8000);
      config.description += ' (enhanced for complex tasks)';
    } else if (taskType === 'simple') {
      config.maxTokens = Math.max(config.maxTokens * 0.7, 500);
      config.description += ' (optimized for simple tasks)';
    }

    return config;
  },

  // Estimated costs for different scenarios
  costEstimates: {
    singleEmail: {
      haiku: 0.0008,      // ~$0.0008 per email
      sonnet35: 0.006,    // ~$0.006 per email  
      opus: 0.03          // ~$0.03 per email
    },
    
    emailSeries: {
      haiku: 0.003,       // ~$0.003 per series
      sonnet35: 0.02,     // ~$0.02 per series
      opus: 0.10          // ~$0.10 per series
    }
  },

  // Monthly budget planning
  budgetPlanning: {
    conservative: {
      budget: 200,        // $200/month
      model: 'haiku',
      emailsSupported: 62500,  // 62K emails/month
      usersSupported: 1000     // ~60 emails per user
    },
    
    balanced: {
      budget: 500,        // $500/month  
      model: 'sonnet-3.5',
      emailsSupported: 8300,   // 8K emails/month
      usersSupported: 500      // ~15 emails per user
    },
    
    premium: {
      budget: 1000,       // $1000/month
      model: 'mixed',     // Haiku for free, Sonnet for paid
      emailsSupported: 25000,  // 25K emails/month  
      usersSupported: 2000     // Mixed usage
    }
  },

  // When Claude 4 becomes available
  claude4Strategy: {
    // Estimated pricing (not official)
    estimatedCosts: {
      input: 0.005,    // Estimated $5 per 1M tokens
      output: 0.025    // Estimated $25 per 1M tokens
    },
    
    // Recommended usage
    useCase: 'Premium tier only',
    reasoning: 'Higher costs justify premium pricing',
    
    // Implementation when available
    implementation: {
      goldTierOnly: true,
      fallbackToSonnet: true,
      premiumFeatures: [
        'Advanced email personalization',
        'Multi-language support', 
        'Complex email sequences',
        'A/B testing suggestions'
      ]
    }
  }
};

// Usage in your email generation service
export const selectModelForUser = async (user, taskComplexity = 'standard') => {
  const userTier = user.subscription_tier || 'free';
  const modelConfig = modelStrategy.getOptimalModel(userTier, taskComplexity);
  
  console.log(`Selected model for ${userTier} user:`, modelConfig);
  
  return {
    model: modelConfig.model,
    maxTokens: modelConfig.maxTokens,
    estimatedCost: modelConfig.costPer1KTokens,
    description: modelConfig.description
  };
};

// Cost tracking and alerts
export const trackModelCosts = {
  calculateCost: (inputTokens, outputTokens, model) => {
    const pricing = {
      'claude-3-haiku-20240307': { input: 0.00025, output: 0.00125 },
      'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
      'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
    };
    
    const modelPricing = pricing[model] || pricing['claude-3-haiku-20240307'];
    
    return {
      inputCost: (inputTokens / 1000) * modelPricing.input,
      outputCost: (outputTokens / 1000) * modelPricing.output,
      totalCost: ((inputTokens / 1000) * modelPricing.input) + ((outputTokens / 1000) * modelPricing.output)
    };
  },
  
  checkBudgetAlert: (monthlySpend, budget) => {
    const percentage = (monthlySpend / budget) * 100;
    
    if (percentage >= 90) return { level: 'critical', message: 'Budget nearly exceeded!' };
    if (percentage >= 75) return { level: 'warning', message: 'Approaching budget limit' };
    if (percentage >= 50) return { level: 'info', message: 'Half budget used' };
    
    return { level: 'ok', message: 'Budget on track' };
  }
};