import { useState } from 'react';
import { Search, ScrollText } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Input } from '@/components/ui/input';
import { PageHeader } from '@/components/shared/PageHeader';
import { LoadingState } from '@/components/shared/LoadingState';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useStaffSearch } from '@/modules/staff/hooks';
import { useAuditLog, useRecentAuditLog } from './hooks';
import type { StaffMember } from '@/modules/staff/api';

const PAGE_SIZE = 20;
const RECENT_AUDIT_LIMIT = 15;

function formatAction(action: string) {
  return action.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function AuditEntryRow({ entry }: { entry: { action: string; createdAt: string; actor: { name: string } | null } }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_minmax(100px,auto)] items-center gap-4 px-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{formatAction(entry.action)}</p>
        <p className="truncate text-xs text-muted-foreground">By {entry.actor?.name ?? 'System'}</p>
      </div>
      <span className="whitespace-nowrap text-right text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
      </span>
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
    <div>
      <PageHeader title="Audit Log" subtitle="View integrity-relevant actions recorded for a staff member." />

      <div className="grid grid-cols-[280px_1fr] gap-6">
        <div>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search staff by name..."
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {isSearching && <p className="text-xs text-muted-foreground px-1">Searching...</p>}

          <div className="space-y-1">
            {searchResults?.map((staff) => (
              <button
                key={staff.id}
                onClick={() => { setSelectedUser(staff); setPage(0); }}
                className={`w-full text-left rounded-lg p-2.5 text-sm ${
                  selectedUser?.id === staff.id ? 'bg-primary/10 border border-primary' : 'hover:bg-muted/50 border border-transparent'
                }`}
              >
                <p className="font-medium">{staff.name}</p>
                <p className="text-xs text-muted-foreground">{staff.email}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          {!selectedUser ? (
            isLoadingRecent ? (
              <LoadingState label="Loading recent audit activity..." />
            ) : recentData?.entries.length ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ScrollText className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-medium">Recent activity</h2>
                </div>
                <div className="overflow-hidden rounded-lg border divide-y">
                  {recentData.entries.map((entry) => (
                    <AuditEntryRow key={entry.id} entry={entry} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground border rounded-lg border-dashed">
                <ScrollText className="h-8 w-8 mb-2" />
                <p className="text-sm">No audit activity has been recorded yet.</p>
              </div>
            )
          ) : isLoadingLogs ? (
            <LoadingState label="Loading audit history..." />
          ) : logData?.entries.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-16">No recorded actions for {selectedUser.name}.</p>
          ) : (
            <div className="overflow-hidden rounded-lg border divide-y">
              {logData?.entries.map((entry) => (
                <AuditEntryRow key={entry.id} entry={entry} />
              ))}

              {logData && logData.totalPages > 1 && (
                <div className="flex items-center justify-between pt-2">
                  <p className="text-sm text-muted-foreground">Page {page + 1} of {logData.totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      className="text-sm text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
                      disabled={page === 0}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </button>
                    <button
                      className="text-sm text-primary disabled:text-muted-foreground disabled:cursor-not-allowed"
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