type CreateSubstitutionActionOptions<TSegment, TResult> = {
  segments: TSegment[];
  create: (segment: TSegment) => Promise<TResult>;
  resetMutation: () => void;
};

export const createSubstitutionSegments = async <TSegment, TResult>({
  segments,
  create,
  resetMutation,
}: CreateSubstitutionActionOptions<TSegment, TResult>): Promise<TResult[]> => {
  try {
    return await Promise.all(segments.map(create));
  } finally {
    resetMutation();
  }
};
