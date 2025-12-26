/**
 * ENOQ L1 TESTS
 * 
 * Real-world messy inputs. Not clean scenarios.
 */

import { debug } from './index';

// ============================================
// TEST CASES - REAL WORLD MESSY
// ============================================

const testCases = [
  // Italian, messy, emotional + relational + decision
  "boh non so più che fare con sto lavoro di merda, oggi il capo mi ha guardato male e mi sono sentito una merda, mia moglie dice che sono sempre stressato ma che cazzo vuole che faccia, non è che posso mollare tutto così, però non ce la faccio più, tu che dici?",
  
  // Very short
  "hey",
  
  // Just a problem statement
  "ho un problema",
  
  // High arousal, crisis adjacent
  "NON CE LA FACCIO PIÙ AIUTO",
  
  // Low arousal, shutdown
  "boh... whatever... non cambia niente comunque",
  
  // Clean delegation attempt
  "dimmi tu cosa devo fare",
  
  // English, decision paralysis
  "I've been going back and forth on this for months. Should I take the job in Singapore or stay here with my family? I just can't decide. Every time I think I've made up my mind, I change it again.",
  
  // English, emotional processing
  "My dad died last month and I don't know what to feel. Some days I'm fine, other days I can't get out of bed.",
  
  // Mixed - task + emotional
  "can you help me write an email to my boss? I need to tell him I'm quitting but I'm terrified",
  
  // Relational conflict
  "she just doesn't understand me. Every time I try to explain how I feel she turns it into a fight about something else",
  
  // Existential
  "what's the point of any of this anyway",
  
  // Simple operational
  "how do I make pasta carbonara",
  
  // Identity crisis
  "I don't even know who I am anymore. I've spent so long being what everyone else wanted me to be"
];

// ============================================
// RUN TESTS
// ============================================

console.log('\n🧪 ENOQ L1 PIPELINE TESTS\n');
console.log('Testing with', testCases.length, 'real-world inputs\n');

for (const testCase of testCases) {
  debug(testCase);
}
