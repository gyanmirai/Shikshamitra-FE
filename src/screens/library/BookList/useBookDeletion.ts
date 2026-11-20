import type { AppDispatch } from 'src/redux/store';

import { useDispatch } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { booksApi, useDeleteBookMutation } from 'src/redux/library/bookList/bookList-api';

import type { IBook } from '../BookManagement/Components/type';

type DeleteState = {
  book: IBook;
  checking: boolean;
  deleting: boolean;
  canDelete: boolean;
  reason: string;
  error: string;
};

export function useBookDeletion(permitted: boolean) {
  const dispatch = useDispatch<AppDispatch>();
  const [remove] = useDeleteBookMutation();
  const [state, setState] = useState<DeleteState | null>(null);
  const sequence = useRef(0);
  const pending = useRef<{ abort: () => void } | null>(null);
  const committing = useRef(false);
  useEffect(
    () => () => {
      sequence.current += 1;
      pending.current?.abort();
    },
    []
  );

  const close = () => {
    if (committing.current) return;
    sequence.current += 1;
    pending.current?.abort();
    pending.current = null;
    setState(null);
  };
  const check = async (book: IBook) => {
    if (!permitted || committing.current || !book.id) return;
    sequence.current += 1;
    const attempt = sequence.current;
    pending.current?.abort();
    setState({ book, checking: true, deleting: false, canDelete: false, reason: '', error: '' });
    const request = dispatch(
      booksApi.endpoints.getBookById.initiate(
        { bookId: book.id },
        { subscribe: false, forceRefetch: true }
      )
    );
    pending.current = request;
    try {
      const current = await request.unwrap();
      if (attempt !== sequence.current) return;
      if (current.id !== book.id) throw new Error('Could not check the selected title. Retry.');
      setState({
        book: { ...book, title: current.title },
        checking: false,
        deleting: false,
        canDelete: current.canDelete === true,
        reason:
          current.deletionBlockedReason ||
          'The server has not confirmed that this title can be deleted.',
        error: '',
      });
    } catch (failure) {
      if (attempt === sequence.current)
        setState((previous) =>
          previous
            ? { ...previous, checking: false, error: parseApiProblemDetail(failure).detail }
            : null
        );
    } finally {
      if (attempt === sequence.current) pending.current = null;
    }
  };
  const confirm = async () => {
    if (!permitted || !state?.canDelete || state.checking || committing.current) return;
    committing.current = true;
    const attempt = sequence.current;
    setState({ ...state, deleting: true, error: '' });
    try {
      await remove({ bookId: state.book.id }).unwrap();
      if (attempt === sequence.current) {
        setState(null);
        shikshaMitraToast.success({ message: 'Book deleted.' });
      }
    } catch (failure) {
      if (attempt === sequence.current)
        setState({
          ...state,
          deleting: false,
          canDelete: false,
          error: parseApiProblemDetail(failure).detail,
        });
    } finally {
      committing.current = false;
    }
  };
  return {
    state,
    busy: Boolean(state?.checking || state?.deleting),
    canConfirm: permitted && state?.canDelete === true,
    open: (book: IBook) => check(book),
    close,
    retry: () => state && check(state.book),
    confirm,
  };
}
