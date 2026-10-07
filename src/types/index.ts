export type Position = -2 | -1 | 0 | 1 | 2;
export type Answer = Position | null;
export type Answers = Record<string, Answer>;
export type Importance = Record<string, 1 | 2 | 3>;
export type SourceType = 'electoral_program' | 'programmatic_document' | 'parliamentary_activity' | 'official_statement' | 'institutional';
export type Stance = 'support' | 'oppose' | 'conditional' | 'related';
export interface Source { sourceTitle: string; sourceUrl: string; sourceDate: string | null; sourceDateLabel?: string; sourcePage?: number | string | null; sourcePages?: number[]; sourceLocator?: string | null; lastVerified: string; demo: boolean; sourceType?: SourceType | null; election?: string | null; validity?: string }
export interface DocumentSource extends Source { id: string; partyIds: string[]; sha256: string | null; pageCount: number | null; verificationStatus: string; verificationMethod: string; verificationNote?: string; pageConvention?: string }
export interface PartyPosition extends Source { position: Position | null; quote: string; summary: string; stance: Stance | null; certainty: 'high' | 'medium' | null; proposalIds: string[]; conflict: boolean; comparisonNote: string }
export interface Question { id: string; issueId: string; category: string; categories: string[]; statement: string; context: { meaning: string; objectives: string; for: string; against: string; implications: string }; sourceContext: string; positions: Record<string, PartyPosition>; relatedProposals: string[]; importantNuances: string[]; lastVerified: string }
export interface Issue { id: string; title: string; category: string; categories: string[]; neutralDescription: string; relatedProposals: string[]; lastVerified: string }
export interface Proposal extends Source { id: string; partyId: string; attributedEntityId?: string; issueId: string; categories: string[]; originalText: string; neutralSummary: string; certainty: 'high' | 'medium' | 'low'; stance: Stance; comparisonEligible: boolean; stanceDirection: 1 | -1 | null; comparisonNote: string; sourceId: string; documentHash: string }
export interface Category { id: string; name: string; icon: string; description: string }
export interface Party { id: string; slug: string; name: string; acronym: string; logo: string | null; logoBackground?: string; website: string | null; programUrl: string | null; programDate: string | null; lastUpdated: string; lastVerified: string; description: string; demo: boolean; type: 'party' | 'coalition' | 'federation'; parliamentaryGroup: string; programs: { sourceId: string; title: string; election: string | null; date: string | null; url: string; lastVerified: string }[]; relations: { type: string; entityId: string; validity: string; sourceUrl: string }[] }
export interface Candidate { id: string; name: string; partyId: string; election: string; officiallyConfirmed: true; confirmationSource: string; confirmationDate: string }
export interface Progress { version: string; answers: Answers; importance: Importance; index: number; completed: boolean }
export type Match = 'coincidence' | 'partial' | 'difference' | 'unknown';
