/**
 * ENOQ MULTI-AGENT SWARM ARCHITECTURE
 *
 * Inspired by:
 * - Global Workspace Theory (Baars) - conscious broadcast
 * - Swarm Intelligence - emergent behavior from simple rules
 * - Society of Mind (Minsky) - multiple specialized agents
 * - A2A Protocol (Google 2025) - agent coordination
 *
 * Architecture:
 * - Meta-Coordinator: Global workspace, routes attention
 * - Domain Specialists: H01-H17 agents with domain expertise
 * - Cross-Cutting Agents: Temporal, Adversarial, Synthesis
 *
 * Constitutional Constraint: Any agent can VETO a response
 * that violates constitutional principles.
 */
import { HumanDomain, FieldState } from './types';
import { DimensionalState } from './dimensional_system';
export type AgentID = 'META_COORDINATOR' | 'TEMPORAL_AGENT' | 'ADVERSARY_AGENT' | 'SYNTHESIS_AGENT' | 'SOMATIC_AGENT' | HumanDomain;
export type MessageType = 'observation' | 'hypothesis' | 'constraint' | 'veto' | 'contribution' | 'broadcast' | 'query' | 'response';
export interface AgentMessage {
    id: string;
    from: AgentID;
    to: AgentID | 'all';
    type: MessageType;
    content: any;
    confidence: number;
    salience: number;
    constitutional_check: boolean;
    timestamp: Date;
}
export interface AgentState {
    id: AgentID;
    active: boolean;
    activation_level: number;
    last_contribution: AgentMessage | null;
    working_memory: AgentMessage[];
}
export interface SwarmState {
    agents: Map<AgentID, AgentState>;
    global_workspace: GlobalWorkspace;
    current_consensus: ConsensusState;
    constitutional_violations: string[];
}
export interface GlobalWorkspace {
    spotlight: {
        user_message: string;
        dimensional_state: DimensionalState;
        field_state: FieldState;
        active_hypotheses: Hypothesis[];
        selected_primitive: string | null;
        response_draft: string | null;
    };
    coherence: number;
    phi: number;
}
export interface Hypothesis {
    id: string;
    source: AgentID;
    content: string;
    type: 'interpretation' | 'need' | 'pattern' | 'risk';
    confidence: number;
    supporting_agents: AgentID[];
    opposing_agents: AgentID[];
}
export interface ConsensusState {
    reached: boolean;
    primary_interpretation: string;
    selected_primitive: string;
    response_elements: Map<AgentID, string>;
    vetoes: VetoRecord[];
}
export interface VetoRecord {
    agent: AgentID;
    reason: string;
    constraint_violated: string;
    timestamp: Date;
}
export declare class AgentSwarm {
    private metaCoordinator;
    private agents;
    private workspace;
    constructor();
    private initializeAgents;
    /**
     * Process user input through the swarm
     */
    process(userMessage: string, dimensionalState: DimensionalState, fieldState: FieldState): Promise<{
        consensus: ConsensusState;
        contributions: Map<AgentID, string>;
        workspace: GlobalWorkspace;
    }>;
    /**
     * Generate final response using synthesis agent
     */
    synthesize(contributions: Map<AgentID, string>, primitive: string): string;
    /**
     * Get current swarm state
     */
    getState(): SwarmState;
}
export declare const agentSwarm: AgentSwarm;
export default agentSwarm;
//# sourceMappingURL=agent_swarm.d.ts.map