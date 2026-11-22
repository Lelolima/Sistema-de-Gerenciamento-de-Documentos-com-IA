import os


def get_storage():
    """Usa Supabase quando SUPABASE_URL e SUPABASE_KEY estão definidos; senão, disco local."""
    if os.getenv("SUPABASE_URL") and os.getenv("SUPABASE_KEY"):
        from storage.supabase_storage import SupabaseStorage
        return SupabaseStorage()
    from storage.local_storage import LocalStorage
    return LocalStorage()
