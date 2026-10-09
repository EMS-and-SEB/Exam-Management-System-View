import { useState } from 'react';
import { Search, ScrollText, User, ChevronRight, Activity } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStaffSearch } from '@/modules/staff/hooks';
import { useAuditLog, useRecentAuditLog } from './hooks';
import type { StaffMember } from '@/modules/staff/api';
import type { AuditLogEntry } from './api';

const PAGE_SIZE = 20;
const RECENT_AUDIT_LIMIT = 15;

function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function getDisplayName(entry: AuditLogEntry) {
  const metadata = entry.metadata;
  if (!metadata) return null;

  if (typeof metadata.displayName === 'string') return metadata.displayName;
  if (typeof metadata.title === 'string') return metadata.title;
  if (typeof metadata.name === 'string') return metadata.name;
  return null;
}

function AuditEntryRow({ entry }: { entry: AuditLogEntry }) {
  const displayName = getDisplayName(entry);

  return (
    <div className="group relative flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors">
      <div className="flex items-start gap-3 min-w-0 pr-4">
        <div className="mt-1.5 h-2 w-2 rounded-full bg-primary/40 shrink-0 group-hover:bg-primary transition-colors" />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium tracking-tight text-foreground">
            {formatAction(entry.action)}
            {displayName && entry.action !== 'STAFF_INVITATION_ACCEPTED' ? (
              <span className="ml-1 text-xs font-normal text-muted-foreground">
                [{displayName}]
              </span>
            ) : null}
          </p>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            By <span className="font-medium text-foreground/80">{entry.actor?.name ?? 'System'}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="inline-flex items-center text-[11px] font-mono text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-md">
          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}

export function AuditLogPage() {
  const [query, setQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<StaffMember | null>(null);
  const [page, setPage] = useState(0);
  const debouncedQuery = useDebouncedValue(query);

  const { data: searchResults, isFetching: isSearching } = useStaffSearch(debouncedQuery);
  const { data: recentData, isLoading: isLoadingRecent } = useRecentAuditLog(RECENT_AUDIT_LIMIT, !selectedUser);
  const { data: logData, isLoading: isLoadingLogs } = useAuditLog(selectedUser?.id ?? '', {
    page: page + 1,
    limit: PAGE_SIZE,
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Audit Log" 
        subtitle="View integrity-relevant actions recorded for a staff member." 
      />

      <div className="grid grid-cols-[300px_1fr] gap-6 items-start">
        <div className="border rounded-xl p-4 bg-card/50 shadow-2xs space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name..."
              className="pl-9 h-9 text-sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isSearching && (
            <p className="text-xs text-muted-foreground px-1 animate-pulse font-mono">Searching staff directory...</p>
          )}

          <div className="drawer-scrollbar space-y-1 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
            {searchResults?.map((staff) => {
              const isSelected = selectedUser?.id === staff.id;
              return (
                <button
                  key={staff.id}
                  onClick={() => { setSelectedUser(staff); setPage(0); }}
                  className={`w-full text-left rounded-lg p-2.5 text-sm transition-all flex items-center justify-between group ${
                    isSelected 
                      ? 'bg-primary/10 border border-primary/40 font-medium text-foreground shadow-2xs' 
                      : 'hover:bg-muted/60 border border-transparent text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <p className={`text-sm truncate ${isSelected ? 'font-semibold text-foreground' : 'font-medium'}`}>
                      {staff.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">{staff.email}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? 'text-primary translate-x-0.5' : 'text-muted-foreground/40 group-hover:text-muted-foreground'}`} />
                </button>
              );
            })}
          </div>

          {selectedUser && (
            <button
              onClick={() => setSelectedUser(null)}
              className="w-full text-center text-xs text-muted-foreground hover:text-foreground pt-2 border-t mt-2 transition-colors font-medium"
            >
              Clear filter (View recent activity)
            </button>
          )}
        </div>

        {/* Main Content Column */}
        <div className="border rounded-xl bg-card shadow-2xs overflow-hidden">
          {!selectedUser ? (
            isLoadingRecent ? (
              <div className="p-12">
                <LoadingState label="Loading recent audit activity..." />
              </div>
            ) : recentData?.entries.length ? (
              <div>
                <div className="flex items-center justify-between px-4 py-3.5 border-b bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    <h2 className="text-sm font-semibold tracking-tight">Recent System Activity</h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    Showing latest {recentData.entries.length} actions
                  </span>
                </div>
                <div className="divide-y">
                  {recentData.entries.map((entry) => (
                    <AuditEntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center px-4">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                  <ScrollText className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium text-foreground">No audit activity recorded</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Integrity-relevant actions performed across the system will appear here automatically.
                </p>
              </div>
            )
          ) : isLoadingLogs ? (
            <div className="p-12">
              <LoadingState label="Loading audit history..." />
            </div>
          ) : logData?.entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center px-4">
              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-foreground">No recorded actions for {selectedUser.name}</p>
              <p className="text-xs text-muted-foreground mt-1">This staff member hasn't triggered any logged audit actions yet.</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-4 py-3.5 border-b bg-muted/20">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight">Audit History: {selectedUser.name}</h2>
                    <p className="text-xs text-muted-foreground font-mono">{selectedUser.email}</p>
                  </div>
                </div>
                {logData && (
                  <span className="text-xs text-muted-foreground font-mono">
                    Page {page + 1} of {logData.totalPages}
                  </span>
                )}
              </div>

              <div className="divide-y">
                {logData?.entries.map((entry) => (
                  <AuditEntryRow key={entry.id} entry={entry} />
                ))}
              </div>

              {logData && logData.totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/10">
                  <p className="text-xs text-muted-foreground font-mono">
                    Page {page + 1} of {logData.totalPages}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium rounded-md border bg-background hover:bg-muted text-foreground disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                      disabled={page >= logData.totalPages - 1}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}