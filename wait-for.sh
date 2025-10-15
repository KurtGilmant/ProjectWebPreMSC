#!/bin/sh

host="$1"
shift
cmd="$@"

until nc -z $(echo $host | cut -d: -f1) $(echo $host | cut -d: -f2); do
  >&2 echo "⏳ En attente de $host..."
  sleep 1
done

>&2 echo "✅ Service prêt : $host"
exec $cmd
