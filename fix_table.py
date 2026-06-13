
import sys

file_path = r'd:\AntiGrav Projects\HR\app\(dashboard)\exhibitions\campaign\[campaignName]\campaign-detail-client.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Target block starts around line 1333 (0-indexed 1332) and ends around 1420
# We'll identify the block by key markers

start_idx = -1
for i, line in enumerate(lines):
    if '<div className="flex items-center gap-3">' in line and i > 1300:
        # Check if it's the right one (within TableBody)
        start_idx = i
        break

if start_idx == -1:
    print("Could not find start index")
    sys.exit(1)

# Find the end of the TableRow (the one we're in)
end_idx = -1
for i in range(start_idx, len(lines)):
    if '</TableRow>' in lines[i]:
        end_idx = i
        break

if end_idx == -1:
    print("Could not find end index")
    sys.exit(1)

# Now we construct the new block
# We want to keep the displayName and callTimeFmt logic if possible, but we already have them as strings in the prompt.
# Actually, we can just replace the lines [start_idx-1 : end_idx+1] or similar.

new_content = """                              <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="size-11 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-black shadow-lg group-hover:scale-105 transition-transform duration-300">
                                    {displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="absolute -bottom-0.5 -right-0.5 size-3.5 bg-background rounded-full border-2 border-background flex items-center justify-center">
                                    <div className="size-full rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                  </div>
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors">{displayName}</p>
                                  <div className="flex items-center gap-1 mt-1">
                                    <MapPin className="size-3 text-muted-foreground/70" />
                                    <p className="text-[11px] text-muted-foreground font-medium truncate">{candidate.City || "Location N/A"}</p>
                                  </div>
                                </div>
                              </div>
                            </TableCell>

                            <TableCell className="px-6 py-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="size-5 rounded-md bg-violet-500/10 flex items-center justify-center">
                                    <MessageSquare className="size-3 text-violet-500" />
                                  </div>
                                  <p className="text-[11px] text-foreground font-medium truncate max-w-[150px]">{candidate.Email}</p>
                                </div>
                                {candidate.PhoneNumber && (
                                  <div className="flex items-center gap-2">
                                    <div className="size-5 rounded-md bg-emerald-500/10 flex items-center justify-center">
                                      <Phone className="size-3 text-emerald-500" />
                                    </div>
                                    <p className="text-[11px] text-muted-foreground font-semibold">{candidate.PhoneNumber}</p>
                                  </div>
                                )}
                              </div>
                            </TableCell>

                            <TableCell className="text-center px-4 sticky right-[320px] bg-card/95 backdrop-blur-md z-20 group-hover:bg-muted/95 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)]">
                              <div className="inline-flex flex-col items-center">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-lg font-black text-foreground">
                                    {typeof candidate.Score === "number" ? candidate.Score.toFixed(0) : candidate.Score}
                                  </span>
                                  <span className="text-[10px] font-bold text-muted-foreground/40">/100</span>
                                </div>
                                <span className="text-[8px] font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Overall</span>
                              </div>
                            </TableCell>

                            <TableCell className="text-center px-6 sticky right-[220px] bg-card/95 backdrop-blur-md z-20 group-hover:bg-muted/95">
                              {callTimeFmt.display ? (
                                <div className="flex flex-col items-center gap-1">
                                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-muted/50 border border-border/50">
                                    <Clock className="size-3 text-muted-foreground/50" />
                                    <span className={cn(
                                      "text-[11px] font-bold",
                                      callTimeFmt.isDone ? "text-emerald-500" : "text-foreground"
                                    )}>
                                      {callTimeFmt.display.split(' ')[0]}
                                    </span>
                                  </div>
                                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter opacity-70">
                                    {callTimeFmt.display.split(' ').slice(1).join(' ')}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground/20 font-light">—</span>
                              )}
                            </TableCell>

                            {!isOptimized && (
                              <TableCell className="text-center px-2 sticky right-[145px] bg-card/95 backdrop-blur-md z-20 group-hover:bg-muted/95">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="ResumeScreening" 
                                  value={candidate.ResumeScreening} 
                                  isFinal={false}
                                />
                              </TableCell>
                            )}

                            <TableCell className="text-center px-2 sticky right-0 bg-card/95 backdrop-blur-md z-20 group-hover:bg-muted/95 shadow-[-4px_0_8px_-4px_rgba(0,0,0,0.1)] border-l border-border/50">
                              <DecisionBadge 
                                candidate={candidate} 
                                roundKey="CallRound" 
                                value={candidate.CallRound} 
                                isFinal={lastRoundKey === "CallRound"}
                              />
                            </TableCell>

                            {(analytics?.numberOfRounds ?? 3) >= 1 && (
                              <TableCell className="text-center px-4">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="HRRound" 
                                  value={candidate.HRRound} 
                                  isFinal={lastRoundKey === "HRRound"}
                                />
                              </TableCell>
                            )}

                            {(analytics?.numberOfRounds ?? 3) >= 2 && (
                              <TableCell className="text-center px-4">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="TechInterviewRound" 
                                  value={candidate.TechInterviewRound} 
                                  isFinal={lastRoundKey === "TechInterviewRound"}
                                />
                              </TableCell>
                            )}

                            {(analytics?.numberOfRounds ?? 3) >= 3 && (
                              <TableCell className="text-center px-4">
                                <DecisionBadge 
                                  candidate={candidate} 
                                  roundKey="ManagerInterview" 
                                  value={candidate.ManagerInterview} 
                                  isFinal={lastRoundKey === "ManagerInterview"}
                                />
                              </TableCell>
                            )}
"""

# We need to find the TableCell open tag before start_idx
row_start_idx = -1
for i in range(start_idx, 0, -1):
    if '<TableCell' in lines[i]:
        row_start_idx = i
        break

if row_start_idx == -1:
    print("Could not find TableCell start")
    sys.exit(1)

# We'll replace from row_start_idx+1 to end_idx-1
# Wait, let's be more precise. We want to replace EVERYTHING between <TableRow ...> and </TableRow> actually.

tr_start_idx = -1
for i in range(row_start_idx, 0, -1):
    if '<TableRow' in lines[i]:
        tr_start_idx = i
        break

if tr_start_idx == -1:
    print("Could not find TableRow start")
    sys.exit(1)

new_tr_content = f"""                          <TableRow
                            key={{candidate.CandidateID || index}}
                            className="border-border hover:bg-muted/80 transition-all duration-200 cursor-pointer group"
                            onClick={() => handleCandidateClick(candidate)}
                          >
                            <TableCell className="px-6 py-4 sticky left-0 bg-card/95 backdrop-blur-md z-20 border-r border-border/50 group-hover:bg-muted/95 shadow-[4px_0_8px_-4px_rgba(0,0,0,0.1)]">
{new_content}
                          </TableRow>
"""

lines[tr_start_idx:end_idx+1] = [new_tr_content]

with open(file_path, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print("Successfully updated")
